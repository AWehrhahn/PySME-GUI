"""
Provides an API Server to the PySME Structures and functions,
that can be called with any ZeroRPC client. In this case specifically the
Electron based GUI for PySME.

To start the server spawn a new python process with `python api.py port`.
Also logs events to `python_server.log`.

Note
----

 - Make sure the passed port is available on the local machine. Otherwise the Server will not be able to start.
 - The server needs to run in the pysme environment (or wherever pysme is installed)
"""
from __future__ import print_function

from functools import wraps
import sys
from os.path import dirname, join
import argparse
import logging

import zerorpc
import gevent, signal
import numpy as np
from scipy.constants import speed_of_light

from sme.sme import SME_Struct
from sme.util import log_version

__version__ = "0.0.1b0"
clight = speed_of_light * 1e-3

logger = logging.getLogger(__name__)
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)
logger.addHandler(ch)


def catch_exception(func):
    @wraps(func)
    def inner(obj, *args, **kwargs):
        try:
            return func(obj, *args, **kwargs)
        except Exception as e:
            logger.exception(e)
            return f"pysme-ERROR: {str(e)}"

    return inner


def requires_load(func):
    @wraps(func)
    def inner(obj, *args, **kwargs):
        if obj.sme is None:
            raise ValueError("SME structure needs to be loaded for this operation")
        return func(obj, *args, **kwargs)

    return inner


class SMEApi(object):
    def __init__(self):
        self.sme = None

    @catch_exception
    def new(self, _=None):
        """ Just create an empty SME structure """
        logger.info("Creating new empty SME structure")
        self.sme = SME_Struct()
        return True

    @catch_exception
    def load(self, text):
        """
        Load a SME file from disk, to work with.
        All future commands will refer to that SME structure
        """
        logger.info("Loaded new SME file: %s", text)
        self.sme = SME_Struct.load(text)
        return self.sme.nseg

    @catch_exception
    @requires_load
    def save(self, fname):
        """ Save current sme structure to disk """
        logger.info("Saving structure to %s", fname)
        self.sme.save(fname)
        return True

    @catch_exception
    @requires_load
    def get_spectrum(self, segment=0):
        logger.info("Requested Spectrum, segment %i", segment)
        x = self.sme.wave[segment]
        y = self.sme.spec[segment]
        return x.tolist(), y.tolist()

    @catch_exception
    @requires_load
    def get_synthetic(self, segment=0):
        logger.info("Requested Synthetic spectrum, segment %i", segment)
        x = self.sme.wave[segment]
        y = self.sme.synth[segment]
        return x.tolist(), y.tolist()

    @catch_exception
    @requires_load
    def get_line_mask(self, segment=0):
        logger.info("Requested Mask of segment %i", segment)
        x = self.sme.wave[segment]
        y = self.sme.spec[segment]
        mask = self.sme.mask[segment]
        x, y = self.create_mask_points(x, y, mask, 1)
        return x.tolist(), y.tolist()

    @catch_exception
    @requires_load
    def get_cont_mask(self, segment=0):
        logger.info("Requested Mask of segment %i", segment)
        x = self.sme.wave[segment]
        y = self.sme.spec[segment]
        mask = self.sme.mask[segment]
        x, y = self.create_mask_points(x, y, mask, 2)
        return x.tolist(), y.tolist()

    @catch_exception
    @requires_load
    def get_annotations(self, args):
        logger.info("Requested annotations")
        logger.debug("Args: %s", args)
        seg = int(args[0])
        wmin = args[1]
        wmax = args[2]

        wave = self.sme.wave[seg]
        wmin = max(float(wmin), wave[0]) if wmin is not None else wave[0]
        wmax = min(float(wmax), wave[-1]) if wmax is not None else wave[-1]

        lines = self.sme.linelist
        vrad = self.sme.vrad[seg]
        xlimits = np.array([wmin, wmax])
        xlimits *= 1 - vrad / clight
        lines = (lines.wlcent > xlimits[0]) & (lines.wlcent < xlimits[1])
        lines = self.sme.linelist[lines]

        logger.debug("Filtered down to %i lines", len(lines))
        # Keep only the 20 stongest lines for performance
        lines.sort("depth", ascending=False)
        lines = lines[:20,]

        x = lines.wlcent * (1 + vrad / clight)
        if self.sme.spec is not None:
            y = np.interp(x, self.sme.wave[seg], self.sme.spec[seg])
        else:
            y = np.interp(x, self.sme.wave[seg], self.sme.smod[seg])

        annotations = []
        for i, line in enumerate(lines):
            annotations += [
                {
                    "x": float(x[i]),
                    "y": float(y[i]),
                    "xref": "x",
                    "yref": "y",
                    "text": f"{line.species}",
                    "hovertext": f"{line.wlcent}",
                    "textangle": 90,
                    "opacity": 1,
                    "ax": 0,
                    "ay": 1.2,
                    "ayref": "y",
                    "showarrow": True,
                    "arrowhead": 7,
                    "xanchor": "left",
                }
            ]

        return annotations

    @catch_exception
    @requires_load
    def set_mask(self, args):
        logger.info("Change mask values")
        segment = int(args[0])
        points = np.array(args[1])
        mask_value = str(args[2])
        logger.debug("Args: %s" % args)

        mask = self.sme.mask[segment]
        idx = np.full(len(mask), False)
        idx[points] = True

        if mask_value == "good":
            value = 1
            idx = idx & (mask == 0)
        elif mask_value == "bad":
            value = 0
        elif mask_value == "line":
            value = 1
            idx = idx & (mask != 0)
        elif mask_value == "cont":
            value = 2
            idx = idx & (mask == 1)
        else:
            raise ValueError("Mask value not recognised")

        # Apply changes if any
        if np.count_nonzero(idx) != 0:
            self.sme.mask[segment][idx] = value

        return True

    @catch_exception
    def echo(self, text):
        """echo any text. Mostly for debugging purposes"""
        logger.debug("Echo: %s", text)
        return text

    def shift_mask(self, x, mask):
        """ shift the edges of the mask to the bottom of the plot,
        so that the mask creates a shape with straight edges """
        for i in np.where(mask)[0]:
            try:
                if mask[i] == mask[i + 1]:
                    x[i] = x[i - 1]
                else:
                    x[i] = x[i + 1]
            except IndexError:
                pass
        return x

    def create_mask_points(self, x, y, mask, value):
        """ Creates the points that define the outer edge of the mask region """
        mask = mask != value
        x = np.copy(x)
        y = np.copy(y)
        y[mask] = 0
        x = self.shift_mask(x, mask)
        return x, y


def parse_port():
    parser = argparse.ArgumentParser(
        description="Run a server that calculates math expressions with Python"
    )
    parser.add_argument(
        "port", type=str, help="The port to run the server on", default="4242"
    )

    args = parser.parse_args()
    port = args.port
    return port


def main():
    filename = "python_server.log"
    filename = join(dirname(__file__), filename)
    logging.basicConfig(
        filename=filename,
        level=logging.DEBUG,
        format="%(asctime)-15s - %(levelname)s - %(name)-8s - %(message)s",
    )

    try:
        addr = "tcp://127.0.0.1:" + parse_port()
        s = zerorpc.Server(SMEApi())
        s.bind(addr)
        gevent.signal(signal.SIGTERM, s.stop)
        gevent.signal(signal.SIGINT, s.stop)
        logger.info("start running on %s", addr)
        log_version()
        logger.debug("Server version: %s", __version__)
        s.run()
    except Exception as e:
        logger.exception("Sever failed to start", e)


if __name__ == "__main__":
    main()

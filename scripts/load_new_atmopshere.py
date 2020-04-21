from pysme.util import start_logging
from pysme.atmosphere.savfile import SavFile
from pysme.atmosphere.krzfile import KrzFile

import json
import argparse
from os.path import dirname, join
from electron import call


@call
def main(fname_in, fname_out, log_file=None):
    if log_file is not None:
        start_logging(log_file)

    if fname_in.endswith(".sav"):
        fileformat = SavFile
    elif fname_in.endswith(".krz"):
        fileformat = KrzFile
    else:
        raise ValueError(
            f"File format {fname_in} not recognised. Expected one of ['.sav', '.krz']"
        )

    data = fileformat(fname_in)

    result = {
        "info": {
            "format": linelist.lineformat,
            "medium": linelist.medium,
            "citation_info": linelist.citation_info,
        },
        "data": data,
    }

    with open(fname_out, "w") as f:
        json.dump(result, f)

    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Create the synthetic spectrum with PySME"
    )
    parser.add_argument("input_file", help="Linelist file to load")
    parser.add_argument("output_file", help="output file name")
    parser.add_argument("--log_file", help="Logfile", default=None)

    args = parser.parse_args()

    fname_in = args.input_file
    fname_out = args.output_file
    log_file = args.log_file

    main(
        fname_in=fname_in,
        fname_out=fname_out,
        linelist_format=linelist_format,
        log_file=log_file,
    )

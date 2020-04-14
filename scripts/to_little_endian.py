from pysme.sme import SME_Structure

import argparse
import numpy as np


def to_little_endian(data):
    try:
        dtype = data.dtype.str
        dtype = f"<{dtype[1:]}"
        data = data.astype(dtype)
    except Exception as ex:
        print(ex)
        pass
    return data


def convert(fname_in, fname_out):
    sme = SME_Structure.load(fname_in)

    for name in sme._names:
        data = getattr(sme, name)
        setattr(sme, name, to_little_endian(data))

    sme.save(fname_out)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert a sme file to small endian.")
    parser.add_argument("input_file", help="sme file to convert")
    parser.add_argument("output_file", help="output file name")

    args = parser.parse_args()

    fname_in = args.input_file
    fname_out = args.output_file

    convert(fname_in, fname_out)

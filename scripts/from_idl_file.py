from pysme.sme import SME_Structure

import argparse


def convert(fname_in, fname_out):
    sme = SME_Structure.load(fname_in)
    sme.save(fname_out)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Convert a idl sme file to regular sme file."
    )
    parser.add_argument("input_file", help="sme file to convert")
    parser.add_argument("output_file", help="output file name")

    args = parser.parse_args()

    fname_in = args.input_file
    fname_out = args.output_file

    convert(fname_in, fname_out)

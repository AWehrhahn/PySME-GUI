import argparse
import pandas as pd
from os.path import dirname, join
from electron import call


@call
def main(fname_in, fname_out, save_data=False):
    if not save_data:
        df = pd.read_feather(fname_in)
        df.to_json(fname_out)
    else:
        df = pd.read_json(fname_in)
        df.to_feather(fname_out)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Read the linelist from a sme file")
    parser.add_argument("input_file", help="input file name")
    parser.add_argument("output_file", help="output file name")
    parser.add_argument("--save", help="save instead of read", action="store_true")

    args = parser.parse_args()

    fname_in = args.input_file
    fname_out = args.output_file
    save = args.save

    main(fname_in=fname_in, fname_out=fname_out, save_data=save)

import argparse
import pandas as pd
from os.path import dirname, join


def main(fname_in, fname_out, save_data=False):
    if not save:
        df = pd.read_feather(fname_in)
        df.to_json(fname_out)
    else:
        save(fname_in, fname_out)

def save(fname_in, fname_out):
    df = pd.read_json(fname_in)
    df.to_feather(fname_out)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Read the linelist from a sme file")
    parser.add_argument("input_file", help="input file name")
    parser.add_argument("output_file", help="output file name")
    parser.add_argument("--save", help="save instead of read", action='store_true')

    args = parser.parse_args()

    fname_in = args.input_file
    fname_out = args.output_file
    save = args.s

    secret_log = join(dirname(__file__), "python.txt")

    with open(secret_log, "w") as f:
        f.write("Hello\n")
        f.write(f"Input file: {fname_in}\n")
        f.write(f"Output file: {fname_out}\n")

    try:
        main(fname_in, fname_out, save_data=save)
    except Exception as ex:
        with open(secret_log, "a") as f:
            f.write(str(ex))
        print(ex)
        exit(1)

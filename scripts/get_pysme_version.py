from pysme import __version__
import argparse


def main(fname_out):
    with open(fname_out, "w") as f:
        f.write(__version__)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Get the pysme version")
    parser.add_argument("output_file", help="output file name")

    args = parser.parse_args()

    fname_out = args.output_file

    main(fname_out)

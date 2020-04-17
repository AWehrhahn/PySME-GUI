from pysme import __version__
import argparse
from os.path import join, dirname
from electron import call


@call
def main(output_file):
    with open(output_file, "w") as f:
        f.write(__version__)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Get the pysme version")
    parser.add_argument("output_file", help="output file name")

    args = parser.parse_args()
    output_file = args.output_file

    main(output_file=output_file)

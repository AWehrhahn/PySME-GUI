import argparse
from os.path import join, dirname
from electron import call, write_error_message

try:
    from pysme import __version__
except ImportError as ex:
    write_error_message("No Installation of PySME found")
    write_error_message("Try using pip install pysme-astro", "a")
    exit(1)


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

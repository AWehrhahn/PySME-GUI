import json
import argparse
from os.path import dirname, join
from electron import call

from pysme.abund import Abund


@call
def main(fname_out, pattern_name, pattern_type="H=12"):
    abund = Abund(monh=0, pattern=pattern_name)
    pattern = abund(type=pattern_type, raw=True)
    pattern = pattern.astype("<f8")
    with open(fname_out, "w") as f:
        pattern.tofile(f)
    return abund


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Create the synthetic spectrum with PySME"
    )
    parser.add_argument("output_file", help="output file name")
    parser.add_argument("pattern", help="pattern name to load", default="asplund2009")
    parser.add_argument(
        "--pattern_type", help="pattern formatting to return", default="H=12"
    )

    args = parser.parse_args()

    fname_out = args.output_file
    pattern_name = args.pattern
    pattern_type = args.pattern_type

    main(fname_out=fname_out, pattern_name=pattern_name, pattern_type=pattern_type)

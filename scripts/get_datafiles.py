import json
import argparse
from os.path import dirname, join
from electron import call

from pysme.large_file_storage import get_available_atmospheres, get_available_nlte_grids


@call
def main(fname_out, filetype):
    if filetype == "atmosphere":
        files = get_available_atmospheres()
    elif filetype == "nlte":
        files = get_available_nlte_grids()
    else:
        raise ValueError(
            f"Filetype not understood, got {filetype} but expected one of 'atmsophere', 'nlte."
        )
    with open(fname_out, "w") as f:
        json.dump(files, f)
    return files


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Create the synthetic spectrum with PySME"
    )
    parser.add_argument("output_file", help="output file name")
    parser.add_argument(
        "filetype",
        help="whether to load atmosphere or nlte files",
        default="atmosphere",
    )

    args = parser.parse_args()

    fname_out = args.output_file
    filetype = args.filetype

    main(fname_out=fname_out, filetype=filetype)

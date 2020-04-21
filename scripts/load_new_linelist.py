from pysme.util import start_logging
from pysme.linelist.vald import ValdFile

import json
import argparse
from os.path import dirname, join
from electron import call


@call
def main(fname_in, fname_out, linelist_format="VALD", log_file=None):
    if log_file is not None:
        start_logging(log_file)

    if linelist_format.lower() == "vald":
        linelist = ValdFile(fname_in)
    else:
        raise ValueError(
            f"Unrecognised linelist format f{linelist_format}. Expected one of ['VALD']"
        )

    data = linelist._lines.to_dict(orient="dict")

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
    secret_log = join(dirname(__file__), "python.txt")
    try:
        parser = argparse.ArgumentParser(
            description="Create the synthetic spectrum with PySME"
        )
        parser.add_argument("input_file", help="Linelist file to load")
        parser.add_argument("output_file", help="output file name")
        parser.add_argument(
            "--format", help="Linelist format (e.g. 'VALD')", default="VALD"
        )
        parser.add_argument("--log_file", help="Logfile", default=None)

        args = parser.parse_args()

        fname_in = args.input_file
        fname_out = args.output_file
        linelist_format = args.format
        log_file = args.log_file

        main(
            fname_in=fname_in,
            fname_out=fname_out,
            linelist_format=linelist_format,
            log_file=log_file,
        )
    except Exception as ex:
        with open(secret_log, "a") as f:
            f.write(str(ex))

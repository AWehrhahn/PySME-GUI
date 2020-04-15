from pysme.sme import SME_Structure
from pysme.synthesize import synthesize_spectrum
from pysme.util import start_logging

import argparse
from os.path import dirname, join


def main(fname_in, fname_out, log_file=None):
    if log_file is not None:
        start_logging(log_file)
    sme = SME_Structure.load(fname_in)
    sme = synthesize_spectrum(sme)
    sme.save(fname_out)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Create the synthetic spectrum with PySME"
    )
    parser.add_argument("input_file", help="sme file to convert")
    parser.add_argument("output_file", help="output file name")
    parser.add_argument("--log_file", help="Logfile", default=None)

    args = parser.parse_args()

    fname_in = args.input_file
    fname_out = args.output_file
    log_file = join(dirname(__file__), "log.log")

    secret_log = join(dirname(__file__), "python.txt")

    with open(secret_log, "w") as f:
        f.write("Hello\n")
        f.write(f"Input file: {fname_in}\n")
        f.write(f"Output file: {fname_out}\n")
        f.write(f"Log file: {log_file}\n")

    try:
        main(fname_in, fname_out, log_file=log_file)
    except Exception as ex:
        with open(secret_log, "a") as f:
            f.write(str(ex))
        print(ex)
        # Exit with failure
        exit(1)

    # Exit with success
    exit(0)

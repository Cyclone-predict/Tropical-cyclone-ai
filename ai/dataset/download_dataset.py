"""
CycloneAI - Dataset Preparation

This script provides the starting point for downloading/preparing
the TCIR dataset.

The raw dataset is NOT stored in GitHub.
"""

from pathlib import Path
import requests


DATA_DIR = Path("data/raw")
DATA_DIR.mkdir(parents=True, exist_ok=True)


def download_file(url: str, output_path: Path) -> None:
    """Download a file from a URL."""

    print(f"Downloading: {url}")

    response = requests.get(url, stream=True, timeout=60)
    response.raise_for_status()

    with open(output_path, "wb") as file:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                file.write(chunk)

    print(f"Saved to: {output_path}")


def main():
    print("CycloneAI Dataset Preparation")
    print("--------------------------------")
    print("Dataset source: TCIR")
    print("Official source:")
    print("https://www.csie.ntu.edu.tw/~htlin/program/TCIR/")
    print()
    print("Raw dataset will be stored in:")
    print(DATA_DIR)
    print()
    print("Before downloading, verify the current dataset")
    print("download links and access instructions on the")
    print("official TCIR page.")


if __name__ == "__main__":
    main()
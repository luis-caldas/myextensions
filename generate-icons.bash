#!/usr/bin/env bash

# Some globals used
SIZES=( 16 32 48 128 256 512 )
EXTENSION="png"

# Split the directory and file name of the input
full_file="${1}"
file_dir="$(dirname -- "$(readlink -f -- "${full_file}")")"
file_name="$(basename -- "${full_file}")"

# Get just the filename without the extension
raw_name="${file_name%.*}"

# Iterate the sizes and generate the icons
for each_size in "${SIZES[@]}"; do
	# Convert all to new sizes
	echo "Converting ${raw_name} to ${each_size}px"
	convert -background none -size "${each_size}x${each_size}" "${full_file}" "${file_dir}/${raw_name}-${each_size}.${EXTENSION}"
done

# Verbose
echo "All done for ${raw_name}"
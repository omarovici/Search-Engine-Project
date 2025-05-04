input_file = "input.txt"
output_file = "output.csv"

with open(input_file, 'r') as infile, open(output_file, 'w') as outfile:
    for line in infile:
        line = line.strip()
        if not line:
            continue  # Skip empty lines

        # Split into label and the values
        if '\t' in line:
            label, values_part = line.split('\t', 1)
        else:
            continue  # Skip malformed lines

        # Split the values by semicolon
        values = values_part.split(';')

        # For each group of values like 358:1:549
        for value in values:
            parts = value.split(':')
            if len(parts) == 3:
                val1, val2, val3 = parts
                outfile.write(f"{label},{val1},{val2},{val3}\n")
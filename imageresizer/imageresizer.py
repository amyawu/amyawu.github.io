# A Python script to resize a JPG image to a specified width and height.
# It uses the Pillow library (a fork of PIL) to handle image processing.

import argparse
from PIL import Image
import os

def resize_image(input_path, output_path, width, height):
    """
    Resizes an image to the specified width and height and saves it.

    Args:
        input_path (str): The path to the input image file.
        output_path (str): The path where the resized image will be saved.
        width (int): The desired width for the new image in pixels.
        height (int): The desired height for the new image in pixels.
    """
    # Check if the input file exists
    if not os.path.exists(input_path):
        print(f"Error: The input file was not found at '{input_path}'")
        return

    try:
        # Open the image file
        with Image.open(input_path) as img:
            # Use the LANCZOS resampling filter for high-quality downscaling
            resized_img = img.resize((width, height), Image.Resampling.LANCZOS)
            
            # Save the resized image
            resized_img.save(output_path)
            
            print(f"Success! Image has been resized to {width}x{height} and saved as '{output_path}'")

    except FileNotFoundError:
        print(f"Error: Could not find the file at '{input_path}'. Please check the path.")
    except IOError:
        print(f"Error: The file '{input_path}' is not a valid image or the format is not supported.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    # Initialize the argument parser to handle command-line inputs
    parser = argparse.ArgumentParser(description="Resize a JPG image to a custom width and height.")
    
    # Define the command-line arguments the script will accept
    parser.add_argument("input_path", type=str, help="Path to the source JPG image file.")
    parser.add_argument("output_path", type=str, help="Path to save the resized image.")
    parser.add_argument("width", type=int, help="The new width of the image in pixels.")
    parser.add_argument("height", type=int, help="The new height of the image in pixels.")

    # Parse the arguments provided by the user
    args = parser.parse_args()

    # Call the main function to perform the resizing
    resize_image(args.input_path, args.output_path, args.width, args.height)

#python image_resizer.py landscape.jpg landscape_small.jpg 451 312
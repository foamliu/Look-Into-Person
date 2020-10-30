from PIL import ImageFilter, ImageDraw, ImageColor


def get_outline(source_image, color):
    outline_image = source_image.copy()
    rows, columns = source_image.size
    coords = []

    RGB = ImageColor.getrgb(color)

    for r in range(0, rows):  # iterates over source image one pixel at a time
        for c in range(0, columns):
            pixel = source_image.getpixel((r, c))

            if pixel == RGB:
                outline_image.putpixel((r, c), (0, 255, 0))
            else:
                outline_image.putpixel((r, c), (0, 0, 0))
    # produces the outline of the segment of interest
    outline = outline_image.filter(ImageFilter.FIND_EDGES)

    for r in range(0, rows):  # iterates over source image one pixel at a time
        for c in range(0, columns):
            pixel = outline.getpixel((r, c))
            if pixel == (0, 255, 0):
                coords.append((r, c))
            else:
                pass

    return coords


def paste_outline(target_image, outline_list, color, thickness):
    # this method overwrites the target_image
    draw = ImageDraw.Draw(target_image)
    rgb_color = ImageColor.getrgb(color)
    for r, c in outline_list:
        target_image.putpixel((r, c), rgb_color)
        draw.rectangle([r - thickness, c - thickness, r + thickness, c + thickness], rgb_color)

    return target_image


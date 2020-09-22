from PIL import Image, ImageFilter




def getOutline(sourceImage, RGB):
    outline_image = sourceImage.copy()
    rows, columns = sourceImage.size

    for r in range(0, rows):  # iterates over source image one pixel at a time
        for c in range(0, columns):
            pixel = sourceImage.getpixel((r, c))

            if pixel == RGB:  # this is hard-coded for now, but we'll need to set this pragmatically
                outline_image.putpixel((r, c), (0, 255, 0))
            else:
                outline_image.putpixel((r, c), (0, 0, 0))
    # produces the outline of the segment of interest
    return outline_image.filter(ImageFilter.FIND_EDGES)


def pasteOutline(originalFile, edgeFile):
    rows, columns = edgeFile.size
    for r in range(0, rows):  # iterates over source image one pixel at a time
        for c in range(0, columns):
            pixel = edgeFile.getpixel((r, c))

            if pixel != (0, 0, 0):
                originalFile.putpixel((r, c), pixel)
    return originalFile


if __name__ == "__main__":
    image = Image.open('../img/dress.png')
    img = image.copy()  # create a copy of the original image to protect the original file against coding errors

    edges = getOutline(img, (85, 0, 0))
    edges.show()
    pasteOutline(img, edges)
    img.show()

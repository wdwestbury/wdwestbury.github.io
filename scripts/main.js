
// open an image in a new window
var open_image = (image_name) => {
    window.open("images/full_size/" + image_name)
    event.preventDefault();
};

// open interactive map in a new page
var open_page = (page_name) => {
    window.open(page_name)
    event.preventDefault();
};

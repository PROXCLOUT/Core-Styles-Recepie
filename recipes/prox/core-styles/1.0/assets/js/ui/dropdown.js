function handleDropdownClick(dropdown) {
    var activeDropdowns = dropdown.parentElement.querySelectorAll(".active");

    // Closes opened dropdowns and then opens (or closes) the one that was just clicked.
    dropdown.classList.toggle("active"); // This should come before removing the 'active' class from the other ones.

    activeDropdowns.forEach(function(activeDropdown) {
        if (activeDropdown !== dropdown) {
            activeDropdown.classList.remove("active");
        }
    });
}

var dropdownWrappers = document.querySelectorAll(".dropdown-wrapper");
dropdownWrappers.forEach(function(dropdownWrapper) {
    var dropdowns = dropdownWrapper.querySelectorAll(".dropdown");
    dropdowns.forEach(function(dropdown) {
        dropdown.addEventListener("click", function() {
            handleDropdownClick(dropdown);
        });
    });
});
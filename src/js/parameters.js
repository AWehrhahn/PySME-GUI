
const update_parameters = () => {
    get_parameters((err, res) => {
        console.log(res)
        var teff = document.getElementById("param-teff")
        teff.value = res.teff.toFixed(2);

    })
}

$(".parameter").on("input", () => {
    console.log("Teff changed");
    $(this).css("has-error", "true")
    console.log($(this))
})

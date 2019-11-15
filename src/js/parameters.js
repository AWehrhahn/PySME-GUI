

var teff = document.getElementById("parameter-teff")
var logg = document.getElementById("parameter-logg")
var monh = document.getElementById("parameter-monh")

const update_parameters = () => {
    get_parameters().then((res) => {
        teff.value = res.teff.toFixed(2);
        logg.value = res.logg.toFixed(2);
        monh.value = res.monh.toFixed(2);
    })
}

$(".parameter").on("input", function () {
    var content = Number(this.value);
    if (Number.isNaN(content)) {
        $(this).css("border-color", "red");
    } else {
        $(this).css("border-color", "green")

        let name = this.id.split("-")[1]
        let dict = {};
        dict[name] = content;
        set_parameters(dict);

    }
})

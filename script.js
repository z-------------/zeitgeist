/* basic functions */

var zpad = function(str, len){
    if (typeof str !== "string") str = str.toString();
    return (new Array(len + 1).join("0") + str).slice(- len);
};

Array.prototype.append = function(arr){
    return [].push.apply(this, arr);
};

HTMLElement.prototype.hide = function(){
    return this.setAttribute("hidden", "true");
};

HTMLElement.prototype.show = function(){
    return this.removeAttribute("hidden");
};

NodeList.prototype.each = function(callback){
    return [].slice.call(this).forEach(callback);
};

/* define elements */

var editor = {};
editor.container = document.querySelector(".editor");
editor.table = editor.container.querySelector(".editor_table");
editor.saveBtn = editor.container.querySelector(".editor_save");

/* define globals */

var zeit = {};
zeit.LOCALSTORAGE_VARNAME = "zeitgeist_table";

/* zeitgeist is go */

editor.saveBtn.addEventListener("click", function(){
    // save table contents into localStorage
    var table = [];
    
    var rows = editor.table.querySelectorAll("tr");
    rows.each(function(row, i){
        var day = {};
        day.index = i;
        day.periods = [];
        
        var tds = row.querySelectorAll("td");
        tds.each(function(elem){
            var nameInput = elem.querySelector("input");
            
            var period = {
                time: "00:00",
                name: nameInput.value
            };
            
            day.periods.push(period);
        });
        
        table.push(day);
    });
    
    localStorage.setItem(zeit.LOCALSTORAGE_VARNAME, JSON.stringify(table));
});

if (!localStorage.getItem(zeit.LOCALSTORAGE_VARNAME)) {
    editor.container.show();
} else {
    zeit.table = JSON.parse(localStorage.getItem(zeit.LOCALSTORAGE_VARNAME));
    console.log(zeit);
}

/* initialize editor */

for (var d = 0; d < 7; d++) {
    var dayElem = document.createElement("tr");
    for (var p = 0; p < 5; p++) {
        var periodElem = document.createElement("td");
        periodElem.innerHTML = "<input type='text' class='editor_periodname' placeholder='Period name'>";
        periodElem.querySelector(".editor_periodname").value = (zeit.table[d].periods[p] ? zeit.table[d].periods[p].name : null);
        dayElem.appendChild(periodElem);
    }
    editor.table.appendChild(dayElem);
}
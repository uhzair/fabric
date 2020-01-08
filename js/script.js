//Render Canvas
var canvas = new fabric.Canvas('canvas',{
    preserveObjectStacking: true
});
fabric.Object.prototype.objectCaching = false;

//Handler for mouse click on canvas
//To detect object clicked and perform appropriate action
function selected(options){
    if (options.target) {
        handleObjectSelection(options.target);
    }
}
canvas.on({'object:selected' : selected, 'selection:updated': selected});
canvas.on('selection:cleared', function(options) {
    clearInputs();
});

//Document Ready
$(function() {
    //Hide text form on load
    $('#textForm').toggle();
    $('#closeTextForm').toggle();
    $('#imgFiltersForm').toggle();
    //Handle layers list
    var prevIndex = "";
    $('#objsList').sortable({
        update: function (event, ui) {
            var moveToIndex = ui.item.index();
            var objToMove = canvas.getObjects()[prevIndex];
            canvas.moveTo(objToMove, moveToIndex);
        },
        start: function (event, ui) {
            prevIndex = ui.item.index();
            canvas.setActiveObject(canvas.getObjects()[prevIndex]);
        }
    });
});

//Function to update layers list
function updateSortable(content, index = -1){
    if(index == -1) {
        var li = $("<li class='list-group-item text-truncate'/>").text(content);
        $("#objsList").append(li);
    }else{
        $('#objsList').children()[index].textContent = content;
    }
    $("#objsList").sortable('refresh');
}

//Function to reset input fields
function clearInputs(){
    $('textarea, input').val('');
    $('#fontSize').val("30");
}

//Function to close forms within tabs
function closeForms(){
    if($('#textForm:visible').length){
        toggleTextForm();
    }
    if($('#imgFiltersForm:visible').length){
        toggleImgForm();
    }
}

//Close forms on pill change
$("a[id^='v-pills']").click(function(){
    closeForms();
});

//Handler for text object selected
function handleTextSelection(object){
    $('#v-pills-text-tab').trigger('click');
    if(!$('#textForm:visible').length){
        toggleTextForm();
    }
    $('#textContent').val(object.text);
    $('#fontSize').val(object.fontSize);
    $('#fontSizeVal').text(object.fontSize);
    $('#fontColor').val(object.fill);
}

//Handler for image object selected
function handleImgSelection(object){
    $('#v-pills-image-tab').trigger('click');
    if(!$('#imgFiltersForm:visible').length){
        toggleImgForm();
    }
}

//Handler for object selected
function handleObjectSelection(object){
    switch(object.type){
        case 'text':
            handleTextSelection(object);
            break;
        case 'image':
            handleImgSelection(object);
            break;
        case 'default':
            break;
    }
}

//Common controls
//Flip
function flip(axis, object){
    object.toggle('flip' + axis);
    canvas.renderAll();
}
$("button[id^='flip']").click(function(){
    if(canvas.getActiveObject() != null) {
        var axis = $(this).attr('id').split("-")[1];
        var object = canvas.getActiveObject();
        flip(axis, object);
    }
});

//Layer Up/Down
function moveLayer(direction, object){
    if(direction == "Up")
        object.bringForward();
    else
        object.sendBackwards();

}
$("button[id^='l-']").click(function(){
    if(canvas.getActiveObject() != null) {
        var direction = $(this).attr('id').split("-")[1];
        var object = canvas.getActiveObject();
        moveLayer(direction, object);
    }
});

//Clip
function clip(shape, object){
    var clipPath;
    if(shape === "circle"){
        clipPath = new fabric.Circle({
            radius: 250, top: -250, left: -250
        });
    }else{
        clipPath = new fabric.Rect({
           width: 300, height: 250, left: -150, top: -125
        });
    }
    object.dirty = true;
    object.clipPath = clipPath;
    canvas.renderAll();
}

$('#unclip').click(function(){
    canvas.getActiveObject().dirty = true;
    canvas.getActiveObject().clipPath = undefined;
    canvas.renderAll();
});

$("button[id^='clip-']").click(function(){
    if(canvas.getActiveObject() != null) {
        var shape = $(this).attr('id').split("-")[1];
        var object = canvas.getActiveObject();
        clip(shape, object);
    }
});

//Toggle text form
function toggleTextForm(){
    $('#textForm').toggle();
    $('#closeTextForm').toggle();
    $('#addText').toggle();
}

$('#addText').click(function(){
    toggleTextForm();
});

$('#closeTextForm').click(function(){
    clearInputs();
    toggleTextForm();
    if(canvas.getActiveObject() != null && canvas.getActiveObject().type === "text") {
        canvas.discardActiveObject();
        canvas.renderAll();
    }
});

//Function to add or modify text
function addText(enteredText, object = null){
    if (enteredText != null && enteredText) {
        if(object == null) {
            object = new fabric.Text(enteredText, {
                left: 200, top: 200, fontSize: 30
            });
            canvas.add(object);
            updateSortable('Text : ' + object.text);
        }else{
            object.text = enteredText;
            canvas.renderAll();
            updateSortable('Text : ' + object.text, canvas.getObjects().indexOf(object));
        }
        canvas.setActiveObject(object);
    }
}

//Textbox change handler
$('#textContent').change(function(){
    var enteredText = $(this).val();
    if(canvas.getActiveObject() != null && canvas.getActiveObject().type === "text") {
        addText(enteredText, canvas.getActiveObject());
    }else {
        addText(enteredText);
    }
});

//Font change
$('.fontApply').click(function(event){
    event.preventDefault();
    if(canvas.getActiveObject() != null && canvas.getActiveObject().type === "text"){
        var activeObj = canvas.getActiveObject();
        activeObj.fontFamily = $(this).text();
        canvas.renderAll();
    }
});

//Text Styling
$('#textBold').click(function(){
    if(canvas.getActiveObject() != null && canvas.getActiveObject().type === "text"){
        var activeObj = canvas.getActiveObject();
        activeObj.fontWeight = (activeObj.fontWeight === 'bold') ? '' : 'bold';
        canvas.renderAll();
    }
});

$('#textItalics').click(function(){
    if(canvas.getActiveObject() != null && canvas.getActiveObject().type === "text"){
        var activeObj = canvas.getActiveObject();
        activeObj.fontStyle = (activeObj.fontStyle === 'italic') ? '' : 'italic';
        canvas.renderAll();
    }
});

$('#textUnderline').click(function(){
    if(canvas.getActiveObject() != null && canvas.getActiveObject().type === "text"){
        var activeObj = canvas.getActiveObject();
        activeObj.underline = !activeObj.underline;
        canvas.renderAll();
    }
});

//Text alignment
function alignText(orientation, object){
    object.textAlign = orientation;
    canvas.renderAll();
}

$("button[id^='align-']").click(function(){
    if(canvas.getActiveObject() != null && canvas.getActiveObject().type === "text"){
        var orientation = $(this).attr('id').split("-")[1];
        alignText(orientation, canvas.getActiveObject());
    }
});

//Font size slider change handler
$('#fontSize').change(function(){
    var slider = $('#fontSize');
    var output = $('#fontSizeVal');
    output.text(slider.val());
    if(canvas.getActiveObject() != null && canvas.getActiveObject().type === "text"){
        var activeObj = canvas.getActiveObject();
        activeObj.fontSize = slider.val();
        canvas.renderAll();
    }
});

//Font color change handler
$('#fontColor').change(function(){
    var color = $(this).val();
    if(canvas.getActiveObject() != null && canvas.getActiveObject().type === "text") {
        canvas.getActiveObject().fill = color;
        canvas.renderAll();
    }
});

//Pixabay API search
$('#imgSearchTerm').change(function(){
    $('#resultText').text('');
    $('#resultImages').html('');
    var searchTerm = $(this).val();
    if(searchTerm != "") {
        var pixabayAPIURL = "https://pixabay.com/api/";
        var APIKey = "14834048-43c6b23f96f9d11553007a09f";
        $.ajax({
            url: pixabayAPIURL,
            type: "GET",
            data: {
                key: APIKey,
                q: searchTerm,
                per_page: 30
            },
            success: function (response) {
                var total = response.totalHits;
                if (total == "0") {
                    $('#resultText').text('No images found');
                } else {
                    $.each(response.hits, function (key, value) {
                        $('#resultImages').append("<img class='img img-responsive col-sm-5 m-1' src='" + value.largeImageURL + "')'></img>");
                    });
                }
            },
            error: function (xhr) {
                console.log(xhr);
            }
        });
    }
});

//Function to toggle image filters form
function toggleImgForm(){
    $('#addImgForm').toggle();
    $('#imgFiltersForm').toggle();
}

$('#closeImgFiltersForm').click(function(){
    toggleImgForm();
    if(canvas.getActiveObject() != null && canvas.getActiveObject().type === "image") {
        canvas.discardActiveObject();
        canvas.renderAll();
    }
});

//Load Image function
//Renders Image from URL to canvas
function loadImage(URL){
    fabric.Image.fromURL(URL, function(oImg) {
        if(oImg._element == null){
            alert('Bad URL');
        }else {
            canvas.add(oImg.scale(0.5));
            canvas.setActiveObject(oImg);
            updateSortable('Img : ' + URL);
        }
    },{ crossOrigin: 'anonymous' });
}

//Handler for images fetched from search
$("#resultImages").on('click', 'img', function(){
    loadImage($(this).attr('src'));
});

//Handler for load from URL button
$('#loadImg').click(function(){
    src = prompt("Enter URL");
    if (src != null && src) {
        loadImage(src);
    }
});

//Handler for image upload
$('#img').change(function(event){
    var file = event.target.files[0];
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (f) {
        var data = f.target.result;
        loadImage(data);
    };
});

//Image filters
function applyFilter(index){
    var imgObj = canvas.getActiveObject();
    if(imgObj.filters[index] === undefined) {
        switch (index) {
            case '0':
                imgObj.filters[index] = new fabric.Image.filters.Grayscale();
                break;
            case '1':
                imgObj.filters[index] = new fabric.Image.filters.Sepia();
                break;
            case '2':
                imgObj.filters[index] = new fabric.Image.filters.Brownie();
                break;
            case '3':
                imgObj.filters[index] = new fabric.Image.filters.Vintage();
                break;
            case '4':
                imgObj.filters[index] = new fabric.Image.filters.BlackWhite();
                break;
        }
    }else{
        imgObj.filters[index] = undefined;
    }
    imgObj.applyFilters();
    canvas.renderAll();
}

$("[id^=applyFilter]").click(function(){
    if(!canvas.getActiveObject() || canvas.getActiveObject().type != "image"){
        alert("Please select an image first");
    }else{
        var id = this.id.split("-")[1];
        applyFilter(id);
    }
});

//Shapes
function addShape(shape){
    switch (shape) {
        case 'Circle':
            var obj = new fabric.Circle({
                radius: 260, fill: 'white', left: 100, top: 100
            });
            break;
        case 'Square':
            var obj = new fabric.Rect({
                fill: 'red', width: 450, height: 450, left: 150, top: 100
            });
            break;
        case 'Rectangle':
            var obj = new fabric.Rect({
                fill: 'pink', width: 450, height: 480, left: 200, top: 100
            });
            break;
        case 'Triangle':
            var obj = new fabric.Triangle({
                fill: 'yellow', width: 400, height: 430, left: 250, top: 100
            });
            break;
    }
    canvas.add(obj);
    canvas.setActiveObject(obj);
    updateSortable(shape);
}

$("button[id^='add-']").click(function(){
    var shape = $(this).attr('id').split("-")[1];
    addShape(shape);
});
fetch('/scrape')
  .then(function(response) {
    return response.json();
  })
  .then(function(myJson) {
    $('h1').html('Scraped Articles')
    myJson.forEach(element => {
        console.log(element)
        let saveoremove = 'saveArticle'
        let addorremove = 'Add Article'
        let color = 'positive'
        console.log('saved is ' + element.saved)
        if(element.saved){
            saveoremove = 'removeArticle'
            addorremove = 'Remove Article'
            color = 'negative'
        }
        $('.articleList').append(`
            <div class="ui segment" style="padding-top: 20px; margin-bottom: 20px;">
                <a href="${element.link}">
                    <h2 class="ui header">${element.title}</h2>
                </a>
                <button class="ui ${color} button" onclick="${saveoremove}('${element.link}','${element.title}','${element.summary}')">${addorremove}</button>
                <p style="font-size: 18px">${element.summary}</p>
            </div>
        `)
    });
  })


function scrapeNew() {
    console.log('scraping new...')
    $('.articleList').empty()

    fetch('/scrape/new')
        .then(function(response) {
            return response.json();
        })
        .then(function(myJson) {
            $('h1').html('Scraped Articles')
            $('.savedLink').removeClass('active')
            $('.homeLink').addClass('active')
            myJson.forEach(element => {
                console.log(element)
                let saveoremove = 'saveArticle'
                let addorremove = 'Add Article'
                let color = 'positive'
                if(element.saved){
                    saveoremove = 'removeArticle'
                    addorremove = 'Remove Article'
                    color = 'negative'
                }
                $('.articleList').append(`
                    <div class="ui segment" style="padding-top: 20px; margin-bottom: 20px;">
                        <a href="${element.link}">
                            <h2 class="ui header">${element.title}</h2>
                        </a>
                        <button class="ui ${color} button" onclick="${saveoremove}('${element.link}','${element.title}','${element.summary}')">${addorremove}</button>
                        <p style="font-size: 18px">${element.summary}</p>
                    </div>
                `)
            });
        })
}

function clearArticles() {  
    event.preventDefault()
    fetch('/saved', {
        method: 'DELETE'
    })
    .then(res => console.log(res))
}

function saveArticle(_link,_title,_summary) {  
    let stuff = {
        link: _link,
        title: _title,
        summary: _summary
    }
    console.log(stuff.link)
    event.preventDefault()
    fetch('/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(stuff)
    })
    .then(res => $(`a[href="${_link}"]`).parent().children('button').replaceWith(`<button class="ui negative button" onclick="removeArticle('${_link}','${_title}','${_summary}')">Remove Article</button>`))
}

function removeArticle(_link,_title,_summary) {
    let stuff = {
        link: _link,
        title: _title,
        summary: _summary
    }
    console.log(stuff.link)
    event.preventDefault()

    if(_title) {
        fetch('/saved/article', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(stuff)
        })
        .then(res => $(`a[href="${_link}"]`).parent().children('button').replaceWith(`<button class="ui positive button" onclick="saveArticle('${_link}','${_title}','${_summary}')">Add Article</button>`))
    }else{
        fetch('/saved/article', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(stuff)
        })
        .then(res => $(`a[href="${_link}"]`).parent().remove())
    }
}

function savedArticles() {  
    $('.articleList').empty()

    fetch('/saved')
        .then(function(response) {
            return response.json();
        })
        .then(function(myJson) {
            $('h1').html('Saved Articles')
            $('.savedLink').addClass('active')
            $('.homeLink').removeClass('active')
            myJson.forEach(element => {
                console.log(element)
                $('.articleList').append(`
                    <div class="ui segment" style="padding-top: 20px; margin-bottom: 20px;">
                        <a href="${element.link}">
                            <h2 class="ui header">${element.title}</h2>
                        </a>
                        <a class="ui button primary" id="test" onclick="viewNotes('${element._id}')"> View Notes </a>
                        <button class="ui negative button" onclick="removeArticle('${element.link}')">Remove Article</button>
                        <p style="font-size: 18px">${element.summary}</p>
                    </div>
                `)
            });
        })
}

function viewNotes(sid) {
    $('#prevNotes').empty();
    
    fetch(`/notes/${sid}`)
    .then(function(response) {
        return response.json();
    })
    .then(function(myJson) {
        myJson.forEach(element => {
            $('#prevNotes').append(`
                <div class="content" id="${element._id}" onclick="removeNote('${element._id}')">
                    <h3>${element.body}</h3>
                </div>
            `)
        })
        $('#addNote').attr('onclick', `addNote('${sid}')`)
        $(".test").modal('show');
    })
}

function addNote(sid) {
    let stuff = {
        sid: sid,
        body: $('#noteBox').val()
    }
    
    fetch('/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(stuff)
    })
    .then(res => {
        $('#prevNotes').append(`
            <div class="content" id="prevNote">
                <h3>${$('#noteBox').val()}</h3>
            </div>
        `)
        $('#noteBox').val('')
        $(".test").modal('hide');
    })
}

function removeNote(sid) {
    console.log('triggered')
    event.preventDefault()
    fetch(`/note/${sid}`, {
        method: 'DELETE'
    })
    .then(res => {
        console.log(res)
        $(`#${sid}`).remove();
    })
}
function viewMap(mapid) {
    var target = "/app/map/view/" + mapid;
    forbidSave();

    new Ajax.Request(target, {
        method: "post",
        parameters: {
            "cache-token": new Date() - Math.random(),            
        },
        onSuccess: function(transport) {
            state = transport.responseText.evalJSON();

            if (state.error.length) {
                $("map").hide();
                $("error").innerHTML = state.error.join("<br>");
            } else {
                $("map").show();
                updateMapId(state.mapid, true);
                drawMap();
                drawGamesPlayed();
                $("map-data").value = state.mapdata;
            }
        }
    });
}

function previewMap() {
    var target = "/app/map/preview/";
    forbidSave();

    new Ajax.Request(target, {
        method: "post",
        parameters: {
            "cache-token": new Date() - Math.random(),
            "map-data": $("map-data").value,
        },
        onSuccess: function(transport){
            state = transport.responseText.evalJSON();

            if (state.error.length) {
                $("map").hide();
                $("error").innerHTML = state.error.join("<br>");
            } else {
                $("map").show();
                updateMapId(state.mapid, state.saved);
                drawMap();
                $("map-data").value = state.mapdata;
                allowSave();
            }
        }
    });
}

function saveMap(mapid) {
    var target = "/app/map/save/";
    forbidSave();

    new Ajax.Request(target, {
        method: "post",
        parameters: {
            "cache-token": new Date() - Math.random(),
            "map-data": $("map-data").value,
        },
        onSuccess: function(transport) {
            $("map").show();
            state = transport.responseText.evalJSON();

            if (state.error.length) {
                $("error").innerHTML = state.error.join("<br>");
            } else {
                document.location = "/map/" + state.mapid;
            }
        }
    });
}

function allowSave() {
    $("save").disabled = false;
}

function forbidSave() {
    $("save").disabled = true;
}

function updateMapId(id, saved) {
    var elem = null;

    if (saved) {
        elem = new Element("a", { "href": "/map/" + id}).updateText(id);
    } else {
        elem = new Element("span").updateText(id);
    }

    $("map-id").updateText("");
    $("map-id").insert(elem);
}

function showMap() {
    var mapid = document.location.pathname.sub(/\/map\//, '');
    if (mapid) {
        viewMap(mapid);
    }
}

function drawGamesPlayed() {
    var table = $("games-played");

    var header = new Element("tr");
    header.insert(new Element("td").updateText("Game"));
    header.insert(new Element("td").updateText("Round"));
    header.insert(new Element("td", {"colspan": 5}).updateText("Factions"));
    table.insert(header);
    state.games.each(function (game) {
        var tr = new Element("tr");
        var link = new Element("a", {"href": "/game/" + game.id}).
            updateText(game.id)
        if (game.finished) {
            game.round = "over";
        }
        tr.insert(new Element("td").insert(link));
        tr.insert(new Element("td").updateText(game.round));
        game.factions.each(function (faction_info) {
            if (faction_info == null) {
                return;
            }
            var faction_name = faction_info.split(/ /)[0];
            var faction = factionTableCell(faction_name);
            faction.updateText(faction_info);
            tr.insert(faction);
        });
        table.insert(tr);
    });    
}
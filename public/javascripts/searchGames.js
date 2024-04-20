$(document).ready(function(){
    // Function to create the list of games
    function createList(data) {
        for(var i = 0; i < data.length; i++){
            const gameInfo = data[i];

            const listItem = $("<li></li>");
            listItem.attr("class", "col");

            const img = $("<img/>");
            img.attr("src", "images/Games/" + gameInfo.image_url);
            img.attr("alt", gameInfo.title);

            const game_card = $("<div></div>");
            game_card.attr("class", "game-card")
            game_card.append(img);

            const game_cover = $("<div></div>");
            game_cover.attr("class", "game-cover");

            const gameTitle = $("<span></span>");
            gameTitle.attr("class", "game-cover-title");
            gameTitle.text(gameInfo.title);

            const seeDetails = $("<button></button>");
            seeDetails.attr("class", "btn btn-primary mt-3 see-details");
            seeDetails.text("See Details");
            seeDetails.data("gameTitle", gameInfo.title);

            game_cover.append(gameTitle);
            game_cover.append(seeDetails);

            game_card.append(game_cover);

            listItem.append(game_card);
            $("#games").append(listItem);
        }
    }

    // Load the game data and create the list on page load
    $.get('./data/games.json', createList);

    // Function to handle filtering on search input keyup
    $("#searchInput").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $("#games li").filter(function() {
            var altText = $(this).find("img").attr("alt").toLowerCase();
            $(this).toggle(altText.indexOf(value) > -1);
        });
    });

    // Function to handle navigation to game details page on search button click
    $("#searchBtn").on("click", function() {
        var searchTerm = $("#searchInput").val().trim().toLowerCase();
        if (searchTerm !== '') {
            const queryParams = new URLSearchParams({ title: searchTerm }).toString();
            window.location.href = "gamedetails.html?" + queryParams;
        }
    });

    // Event delegation for dynamically added elements (see-details buttons)
    $(document).on("click", ".see-details", function(){
        const gameTitle = $(this).data("gameTitle");
        const queryParams = new URLSearchParams({ title: gameTitle }).toString();
        window.location.href = "gamedetails.html?" + queryParams;
    });
});

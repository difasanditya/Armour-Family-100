var questionlist, question, answers, score, turn, isNewGame, fault, point, rightAnswer, bgSound, rightSound, wrongSound;

var testSound;

$(function () {
    bgSound = new SeamlessLoop();
    bgSound.addUri("../sfx/bg.mp3", 7994, "main");
    bgSound.start("main");
    rightSound = new Audio('../sfx/right.mp3');
    wrongSound = new Audio('../sfx/wrong.mp3');
    switchFade("#main-menu-container", "#score-container, #done, #list-question-container, #quiz-container, #winner-container", null, null, 0);
});

$("#start").click(function () {
    $.getJSON('/get-question', function (data) {
        questionlist = data;
        score = [0, 0];
        setScore(0, 0);
        setScore(1, 0);
        initQuestionList();
        switchFade("#score-container, #list-question-container", "#main-menu-container")
    });
});

function initQuestionList() {
    questionlist.forEach(function(_, idx) {
        $("#list-question-container").append("<button class='question' id='question-" + (idx + 1) + "'>" + (idx + 1) + "</button>");
        $("#question-" + (idx + 1)).click(function () {
            initGame(idx);
            $(this).addClass("opened");
            $(this).prop('disabled', true);
        });
    });
}

function initGame(idx) {
    question = questionlist[idx].question;
    answers = questionlist[idx].answers;
    fault = rightAnswer = point = 0;
    isNewGame = true;
    setPoint(0);
    $("#fault-container > .fault").removeClass("red");
    $("#turn, button:not(.select)").removeClass("team-a team-b");
    $("#turn").html("Menentukan Giliran");
    $("#question").html(question);
    $("#answer-container").empty();
    answers.forEach(function (opt, idx) {
        $("#answer-container").append("<div class='row' id='row-" + idx + "'><div class='number'><p>" + (idx + 1) + ".</p></div><div class='answer invisible'><p>" + opt.option.join(" / ") + "</p></div><div class='point invisible'><p>" + opt.value + "</p></div></div>");
    });
    switchFade("#action-container, #reveal", "#final-action-container, #select-team-container", null, null, 0);
    $("#done").fadeOut(500);
    switchFade("#quiz-container", "#list-question-container");
}

$("#action-container").submit(function (event) {
    event.preventDefault();
    var answer = $("#answer").val();
    if (answer == "") return;
    $("#answer").val("");
    for (var i = 0; i < answers.length; i++) {
        if (answers[i].option.includes(answer.toLowerCase())) {
            if(answers[i].revealed) return;
            rightSound.play();
            rightAnswer++;
            answers[i].revealed = true;
            $("#row-" + i + " > div").removeClass("invisible");
            setPoint(answers[i].value);
            if(isNewGame && (i == 0 || rightAnswer == 2 || fault == 1)) {
                switchFade("#select-team-container", "#action-container");
                isNewGame = false;
                fault = 0;
            }
            else if (rightAnswer == answers.length) endGame();
            else if (fault == 3) endGame(turn == 0 ? 1 : 0);
            return;
        }
    }
    wrongSound.play();
    if(isNewGame) {
        if(rightAnswer != 0) {
            switchFade("#select-team-container", "#action-container");
            isNewGame = false;
            fault = 0;
        }
        else fault = fault == 1 ? 0 : 1;
    }
    else if (fault == 3) endGame();
    else {
        fault++;
        $("#fault-container > .fault:nth-child(" + (fault) + ")").addClass("red");
        if (fault == 3) changeTurn(turn == 0 ? 1 : 0);
    }
});

$("#reveal").click(function () {
    for (var i = 0; i < answers.length; i++)
        $("#row-" + i + " > div").removeClass("invisible");
});

$("#back").click(function () {
    switchFade("#list-question-container", "#quiz-container", null, function() {if (score[0] != score[1]) $("#done").fadeIn(500);});
});

$("#done").click(function () {
    $("#winner-container").removeClass("team-a team-b");
    $("#winner-container").addClass("team-" + (score[0] > score[1] ? "a" : "b"));
    $("#winner").html("Pemenangnya adalah tim " + (score[0] > score[1] ? "A" : "B"));
    switchFade("#winner-container", "#done, #list-question-container");
});

$("#reset").click(function () {
    $("#list-question-container").empty();
    switchFade("#main-menu-container", "#winner-container, #score-container", function(){$("#winner-container").removeClass("blue");});
});

$(".select").click(function () {
    turn = $(this).attr("id") == "select-a" ? 0 : 1; 
    changeTurn(turn);
    switchFade("#action-container", "#select-team-container");
});

function setPoint(newPoint) {
    point += newPoint;
    $("#point").html(point);
}

function setScore(player, point) {
    score[player] += point;
    $("#team-" + (player == 0 ? "a" : "b") + " > .score").html(score[player]);
}

function changeTurn(player) {
    $("#turn, button:not(.select)").removeClass("team-a team-b");
    $("#turn, button:not(.select)").addClass("team-" + (player == 0 ? "a" : "b"));
    $("#turn").html("Giliran Tim " + (player == 0 ? "A" : "B"));
}

function endGame(winner = turn) {
    setScore(winner, point);
    switchFade("#final-action-container", "#action-container", null, function(){ if (rightAnswer == answers.length) $("#reveal").fadeOut(0); }, 250);
}

function switchFade(appear, disappear, fadeInCallback = null, afterFadeInFunction = null, time = 500) {
    $(disappear).fadeOut(time, function () {
        $(appear).fadeIn(time, fadeInCallback);
        if(afterFadeInFunction != null) afterFadeInFunction.apply(this, null);
    });
}
//--------------------------------------------------------------------------
//
//  QUIZ
//
//--------------------------------------------------------------------------


var quiz = (function(){

  var BASE_URL = "data/quiz.csv"
  var totalQuestions = 0;
  var currentScore = 0;
  var currentQuestion = 0;

  var summaryList = [];
  var questionList = [];
  var storyList = [];
  var question;

  var welcome;
  var intro;

  var $welcome;
  var $intro;
  var $title;
  var $count;
  var $answer1;
  var $answer2;
  var $answer3;
  var $score;
  var $responseTitle;
  var $response;
  var $link;
  var $image;
  var $nextBtn;
  var $submitBtn;
  var $alert;
  var $twitterBtn
  var $fbBtn



  function showScore(){
      $score.text("Score: " + currentScore + " out of " + totalQuestions);
      $score.show();
  }


  function checkAnswer(id){
    var textResponse = "response" + id
    
    if(id === question.answer){
      $responseTitle.text("Correct!");
      currentScore++;
    }else{
      $responseTitle.text("Wrong!");
    }

    $response.text( question[textResponse]);

    $link.html( "For more information on this subject, visit <a target='_blank' href='http://" + question.link + "' >"+ question.linkTitle + "</a>");
    $link.show();
    
    $responseTitle.show();
    $response.show();
    showScore();

    $submitBtn.hide();
    $nextBtn.show();
  }


  function showQuestion(){
    $welcome.hide();
    $intro.hide();
    //hide exisiting responses
    $responseTitle.hide();
    $response.hide();
    $link.hide();
    
    question = questionList[currentQuestion];

    $title.text (question.title);
    $answer1.html ('<label for="ans1"><input id="ans1" type="radio" value="1" name="radioBtn"><span class="labelText">' + question.question1 + '</span></input></label>' );
    $answer2.html ('<label for="ans2"><input id="ans2" type="radio" value="2" name="radioBtn"><span class="labelText">' + question.question2 + '</span></input></label>' );
    $answer3.html ('<label for="ans3"><input id="ans3" type="radio" value="3" name="radioBtn"><span class="labelText">' + question.question3 + '</span></input></label>' );

    $( "input:radio" ).on("click", function(event){
      $alert.text("");
    } );

    $title.show();
    $answer1.show();
    $answer2.show();
    $answer3.show();
    $submitBtn.show();

    //add image tag
    $image.empty();
    $image.append('<image alt="decorative image" src="'+question.image+'"/>');

    //disable next button until answer selected
    $nextBtn.hide();

    showScore();
    //set focus back on first radio button
    document.forms["form1"].elements["radioBtn"][0].focus();
  }


  function parseData(results){
    var introImage;
    var str = "";

    questionList =[];
    summaryList =[];
    storyList =[];

    //set data 
    $.each(results, function(itemNo, item)
    {

      if (item[0].indexOf("Question")==0){
        var question = {};
        question.title = item[1];
        question.question1 = item[2];
        question.question2 = item[3];
        question.question3 = item[4];
        question.response1 = item[5];
        question.response2 = item[6];
        question.response3 = item[7];
        question.answer = item[8];
        question.linkTitle = item[9];
        question.link = item[10];
        question.image = item[11];
        totalQuestions++;

        questionList.push(question);
      }
      if (item[0].indexOf("Summary")==0){
        var summary = {};
        summary.text = item[1];
        summary.image = item[2];
        summaryList.push(summary);
      }
      if (item[0].indexOf("Introduction")==0){
        welcome =  item[1];
        intro = item[2];
        introImage = item[3];
      }
      if (item[0].indexOf("Story")==0){
        var story =[];
        story.title = item[1];
        story.link = item[2];
        storyList.push(story);
      }
    });

    $("ul#stories").empty();
    $.each(storyList, function(itemNo, item)
    {

      str += "<li><a title='" + item.title + "' href='http://" + item.link + "' target='_blank'>" + item.title + "</a></li>"

    });
    $("#stories").append(str);

    $("#count").text ("There are " + totalQuestions + " questions");
    currentQuestion = 0;

    //add image tag
    $image.empty();
    $image.append('<image alt="decorative image" src="' + introImage + '"/>');
  }


  function loadData(file_url){
    $.ajax({
      dataType: "text",

      url: file_url,
      data: "String",
      success: function(data, status, xhr) {
        results = $.csv.toArrays(data);
        parseData(results);

        showIntroduction();
      },
      error: function(data) {
        console.log("error");
      }
    });
  }


  function showIntroduction(){
    //hide questions
    $count.hide();
    $title.hide();
    $answer1.hide();
    $answer2.hide();
    $answer3.hide();
    $submitBtn.hide();

    $responseTitle.hide();
    $response.hide();

    $welcome.text(welcome);
    $welcome.show();
    $intro.text(intro);
    $intro.show();

    $responseTitle.text("Your score: "+ currentScore + " out of " + totalQuestions);
    $response.text(summaryList[currentScore]);
  }


  function showEndSummary(){
    //hide questions
    $count.hide();
    $title.hide();
    $answer1.hide();
    $answer2.hide();
    $answer3.hide();
    $submitBtn.hide();


    $mainScore.text("Final Score " + currentScore + " out of " + totalQuestions);
    $mainScore.show();
    $link.hide();

    $responseTitle.text("Your score: "+ currentScore + " out of " + totalQuestions);
    $response.text(summaryList[currentScore].text);
    $response.show();

    $image.empty();
    $image.append('<image alt="decorative image" src="' + summaryList[currentScore].image + '"/>');
    $nextBtn.hide();


    // set the data attribute and load fb button
    $('a[data-text]').each(function(){
      $(this).attr("data-text", "I scored "+ currentScore + " out of " + totalQuestions + " on the #ONS quiz. Try it yourself.");
    });

    $.getScript('http://platform.twitter.com/widgets.js');
    $twitterBtn.show();
    $fbBtn.show();

  }




  $(document).ready(function() {
    // get references to DOM
    $welcome = $("#welcome");
    $intro = $("#intro");
    $count = $("#count");
    $mainScore = $("#mainScore");
    $title = $("#title");
    $answer1 = $("#answer1");
    $answer2 = $("#answer2");
    $answer3 = $("#answer3");
    $score = $("#score");
    $responseTitle = $("#responseTitle");
    $response = $("#response");
    $link = $("#link");
    $image = $("#imgHolder");
    $nextBtn = $('#nextBtn');
    $submitBtn = $('#submitBtn');
    $alert = $('#alert');
    $twitterBtn = $('#twitterBtn');
    $fbBtn = $('#facebookBtn');


    $mainScore.hide();
    $twitterBtn.hide();
    $fbBtn.hide();


    // click listeners
    $('li[id^="question"]').on ("click", function(){
      var id = this.id.substring(8);
      checkAnswer(id);
    }); 

    $nextBtn.on ("click", function(evt){
      evt.preventDefault;
      if(currentQuestion==totalQuestions){
        showEndSummary();
      }else{
        showQuestion();
      }
      currentQuestion++;
    }); 

    $nextBtn.on("keyup", function(event){
      event.preventDefault;
      if(event.keyCode == 13){
        if(currentQuestion==totalQuestions){
          showEndSummary();
        }else{
          showQuestion();
        }
        currentQuestion++;
      }
    })

    $submitBtn.on ("click", function(event){
      event.preventDefault;
      var val = $('input[name=radioBtn]:checked', '#form1').val();
      if(val){
        checkAnswer(val);
      }else{
        $alert.text("Please select an answer.");
      }
    });

    $submitBtn.on ("keyup", function(event){
      event.preventDefault;
      if(event.keyCode == 13){
        var val = $('input[name=radioBtn]:checked', '#form1').val();
        checkAnswer(val);
      }
    });

    $( "input:radio" ).click(function(event){
      $alert.text("");
    });

    //init
    loadData(BASE_URL);

  });


  function fbs_click() {
    u=location.href;
    t=document.title;
    window.open('http://www.facebook.com/sharer.php?u='+encodeURIComponent(u)+'&t='+encodeURIComponent(t),'sharer','toolbar=0,status=0,width=626,height=436');
    return false;
  }



}());

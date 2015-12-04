<!-- send the email to me -->
<?php
  if (isset($_POST["submit"]))
    {
        $name    = $_POST["name"];
        $email   = $_POST["email"];
        $phone   = $_POST["phone"];
        $message = $_POST["message"];
        $email   = 'wwestbury@wisc.edu';

        if(isset($name) && isset($email) && isset($phone) && isset($message))
        {
            $from    = "From: $name<$email>\r\nReturn-path: $email";
            $subject = "I wanna talk maps";
            mail("wwestbury@wisc.edu", $subject, $message, $from, $phone);
        }
        else
        {
            echo "please fill out all fields";
        }
    }
?>

<!-- a little js to make it all happen super slick like -->

<script>
    // add focus to the name field
    $(function()
    {
        $("#name").focus();       
    });

    // when form is submitted stay on the form page
    $("#contactMe").click(function()
    {
        $("#content").load("../CartPortfolio/php/contact.php");

        return false;
    });
</script>

<div class="container">
    <div class="row">
        <div class="col-md-12">
            <div id="formWrapper">
                <form enctype="multipart/form-data" class="form-horizontal" method="post" action="<?php echo $_SERVER['PHP_SELF']; ?>" >
                    <fieldset>
                        <legend id="legend">Contact Me</legend>

                        <div class="form-group">
                            <span class="col-md-1 col-md-offset-1 text-center"><i class="fa fa-user bigicon"></i></span>
                            <div class="col-md-8">
                                <input id="name" name="name" type="text" placeholder="Name" class="form-control">
                            </div>
                        </div>

                        <div class="form-group">
                            <span class="col-md-1 col-md-offset-1 text-center"><i class="fa fa-envelope-o bigicon"></i></span>
                            <div class="col-md-8">
                                <input id="email" name="email" type="text" placeholder="Email Address" class="form-control">
                            </div>
                        </div>

                        <div class="form-group">
                            <span class="col-md-1 col-md-offset-1 text-center"><i class="fa fa-phone-square bigicon"></i></span>
                            <div class="col-md-8">
                                <input id="phone" name="phone" type="text" placeholder="Phone" class="form-control">
                            </div>
                        </div>

                        <div class="form-group">
                            <span class="col-md-1 col-md-offset-1 text-center"><i class="fa fa-pencil-square-o bigicon"></i></span>
                            <div class="col-md-8">
                                <textarea class="form-control" id="message" name="message" placeholder="Enter your message here. I'll get back to you ASAP." rows="7"></textarea>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="col-md-12 text-center">
                                <button id="contactMe" type="submit" name="submit" class="btn btn-primary btn-lg">Submit</button>
                            </div>
                        </div>
                    </fieldset>
                </form>
            </div>
        </div>
    </div>
</div>

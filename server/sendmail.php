<?php
ini_set("display_errors",true);
error_reporting(E_ERROR);

require("../phpmailer/class.phpmailer.php");

$name = addslashes($_POST['name']);
$email = addslashes($_POST['email']);
$phone = addslashes($_POST['phone']);
$subject = addslashes($_POST['subject']);
$message = addslashes($_POST['message']);

$smtp_email = "email-ssl.com.br";
$usuario_email = "admin@piquiatuba.com.br";
$senha_email = "piquia2018##";
$nome_email = "site piquiatuba";

$mail = new PHPMailer();
$mail->IsSMTP(); 
$mail->Host = $smtp_email;
$mail->SMTPAuth = true; // Usa autenticação SMTP? (opcional)
$mail->Username = $usuario_email;
$mail->Password = $senha_email;

// Define o remetente
$mail->From = $usuario_email;
$mail->FromName = 'Site Piquiatuba';

// Define os destinatário(s)
$mail->AddAddress("ti@piquiatuba.com.br");
$mail->AddAddress("contato@piquiatuba.com.br");
$mail->AddAddress("marlisson@piquiatuba.com.br");
$mail->AddAddress("edson.silva@piquiatuba.com.br");

$mail->IsHTML(true); // Define que o e-mail será enviado como HTML
$mail->CharSet = 'UTF-8'; // Charset da mensagem (opcional)

$full_message = "";
$full_message = $full_message."Nome: ".$name." <br/>";
$full_message = $full_message."Email: ".$email." <br/>";
$full_message = $full_message."Telefone: ".$phone." <br/>";
$full_message = $full_message."Assunto: ".$subject." <br/>";
$full_message = $full_message."Menssagem: ".$message." <br/>";

// Define a mensagem (Texto e Assunto)
$mail->Subject  = "Solicitação de Contato Via Site";
$mail->Body = $full_message;

try {
    $enviado = $mail->Send();
} catch (Exception $e) {
    echo 'Exceção capturada: ',  $e->getMessage(), "\n";
}    

// Limpa os destinatários e os anexos
$mail->ClearAllRecipients();
$mail->ClearAttachments();

// Exibe uma mensagem de resultado
if ($enviado) {
    echo "";
} else {
    echo "Não foi possível enviar o e-mail.<br /><br /> <b>Informações do erro:</b> <br />" . $mail->ErrorInfo;
}

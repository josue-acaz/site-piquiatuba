
function sendContact() {
	jQuery('#dvRetornoAjax').html('<h3>Enviando...').show();
	jQuery('#bt_send').attr('disabled', true);
	var dados = jQuery('#contact_form').serialize();
	
	jQuery.ajax({
		type: 'POST',
		url: 'server/sendmail.php',
		data: dados,
		error: function( erro ){ 
			jQuery('#dvRetornoAjax').html('<strong>ERRO:</strong> Ocorreu uma falha inesperada. ' + erro ).show();
			jQuery('#bt_send').attr('disabled', false);
		 },
		success: function( data ) { 
			jQuery('#bt_send').attr('disabled', false);
			if (data==''){
				jQuery('#contact_form').trigger("reset");
				jQuery('#dvRetornoAjax').html('<h3>Sua Mensagem foi enviada. Aguarde nosso contato.</h3>').show();
			}else{
				jQuery('#dvRetornoAjax').html('<h3>ERRO: Ocorreu uma falha inesperada. </h3>' + erro ).show();
			}

		}
	});
	return false;	
}


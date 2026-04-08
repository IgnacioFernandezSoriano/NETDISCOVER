import emailjs from '@emailjs/browser';

// Configuración de EmailJS (el usuario deberá configurar su cuenta y obtener estos IDs)
// Por ahora usamos placeholders que el usuario puede rellenar o yo puedo configurar si me da las credenciales.
const SERVICE_ID = 'service_upu_one';
const TEMPLATE_ID_PROCESS = 'template_one_process';
const TEMPLATE_ID_COMPLETE = 'template_one_complete';
const PUBLIC_KEY = 'user_your_public_key';

export interface EmailParams {
  to_email: string;
  cc_email: string;
  subject: string;
  body: string;
  user_email?: string;
  user_name?: string;
  organization?: string;
  country?: string;
  report_summary?: string;
}

export const sendNotificationEmail = async (params: EmailParams) => {
  try {
    // Nota: EmailJS requiere una cuenta configurada. 
    // Si no hay cuenta, simulamos el envío para no romper la app pero avisamos en consola.
    if (PUBLIC_KEY === 'user_your_public_key') {
      console.log('📧 Simulación de envío de email (Falta configurar PUBLIC_KEY):', params);
      return { status: 200, text: 'Simulated success' };
    }

    return await emailjs.send(
      SERVICE_ID,
      params.subject.includes('process') ? TEMPLATE_ID_PROCESS : TEMPLATE_ID_COMPLETE,
      {
        ...params,
        reply_to: params.user_email || '',
      },
      PUBLIC_KEY
    );
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    throw error;
  }
};

export const notifySurveyInProcess = async (userEmail: string) => {
  return sendNotificationEmail({
    to_email: 'houssem.GHARBI2@upu.int',
    cc_email: 'ignacio.FERNANDEZ@upu.int',
    subject: 'New ONE survey in process',
    body: "There's a new candidate who is currently topping the ONE survey.",
    user_email: userEmail
  });
};

export const notifySurveyComplete = async (profile: any, scores: any, reportSummary: string) => {
  return sendNotificationEmail({
    to_email: 'houssem.GHARBI2@upu.int',
    cc_email: 'ignacio.FERNANDEZ@upu.int',
    subject: 'New ONE Survey complete',
    body: `A new survey has been completed by ${profile.name} from ${profile.organization} (${profile.country}).`,
    user_name: profile.name,
    organization: profile.organization,
    country: profile.country,
    user_email: profile.email,
    report_summary: reportSummary
  });
};

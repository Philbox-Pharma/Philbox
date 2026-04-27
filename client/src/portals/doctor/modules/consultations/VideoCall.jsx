import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import {
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaPhoneSlash,
  FaExpand,
  FaCompress,
  FaNotesMedical,
  FaArrowLeft,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUserMd,
  FaUser,
  FaClock,
  FaStethoscope,
} from 'react-icons/fa';
import { doctorAppointmentsApi } from '../../../../core/api/doctor/appointments.service';

export default function VideoCall() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { doctor } = useOutletContext();

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [meetingInfo, setMeetingInfo] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Complete consultation modal
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [completing, setCompleting] = useState(false);

  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const timerRef = useRef(null);

  // Fetch meeting info
  const fetchMeetingInfo = useCallback(async () => {
    try {
      setLoading(true);
      const response = await doctorAppointmentsApi.getMeetingInfo(appointmentId);
      const data = response.data || response;
      setMeetingInfo(data);

      // If already in-progress with a meeting link, auto-join
      if (data.status === 'in-progress' && data.meeting_link) {
        setCallActive(true);
      }
    } catch (err) {
      console.error('Failed to fetch meeting info:', err);
      setError(err.response?.data?.message || 'Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    fetchMeetingInfo();
  }, [fetchMeetingInfo]);

  // Timer for call duration
  useEffect(() => {
    if (callActive && !callEnded) {
      timerRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callActive, callEnded]);

  // Initialize Jitsi Meet
  useEffect(() => {
    if (!callActive || callEnded || !meetingInfo?.meeting_link) return;

    // Extract room name from meeting link
    const roomName = meetingInfo.meeting_link.split('/').pop();

    const loadJitsi = () => {
      if (!jitsiContainerRef.current) return;

      // Clean up previous instance
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }

      const domain = 'meet.jit.si';
      const options = {
        roomName: roomName,
        parentNode: jitsiContainerRef.current,
        width: '100%',
        height: '100%',
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          toolbarButtons: [
            'microphone', 'camera', 'desktop', 'fullscreen',
            'chat', 'raisehand', 'tileview', 'settings',
          ],
          enableWelcomePage: false,
          enableClosePage: false,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          DEFAULT_BACKGROUND: '#0f2b3d',
          TOOLBAR_ALWAYS_VISIBLE: true,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          MOBILE_APP_PROMO: false,
          HIDE_INVITE_MORE_HEADER: true,
        },
        userInfo: {
          displayName: doctor?.fullName
            ? (doctor.fullName.toLowerCase().startsWith('dr')
              ? doctor.fullName
              : `Dr. ${doctor.fullName}`)
            : 'Doctor',
          email: doctor?.email || '',
        },
      };

      try {
        // eslint-disable-next-line no-undef
        const api = new JitsiMeetExternalAPI(domain, options);
        jitsiApiRef.current = api;

        api.addEventListener('readyToClose', () => {
          handleEndCall();
        });

        api.addEventListener('participantLeft', () => {
          // Could track when patient leaves
        });
      } catch (err) {
        console.error('Failed to initialize Jitsi:', err);
        setError('Failed to load video call. Please refresh the page.');
      }
    };

    // Load Jitsi External API script if not already loaded
    if (window.JitsiMeetExternalAPI) {
      loadJitsi();
    } else {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = loadJitsi;
      script.onerror = () => {
        setError('Failed to load video call library. Check your internet connection.');
      };
      document.head.appendChild(script);
    }

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [callActive, callEnded, meetingInfo, doctor]);

  // Start consultation
  const handleStartCall = async () => {
    try {
      setStarting(true);
      setError('');
      const response = await doctorAppointmentsApi.startConsultation(appointmentId);
      const data = response.data || response;

      setMeetingInfo(prev => ({
        ...prev,
        ...data.appointment,
        meeting_link: data.meeting_link,
        status: 'in-progress',
      }));
      setCallActive(true);
    } catch (err) {
      console.error('Failed to start consultation:', err);
      setError(err.response?.data?.message || 'Failed to start consultation');
    } finally {
      setStarting(false);
    }
  };

  // End call
  const handleEndCall = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
      jitsiApiRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setCallEnded(true);
    setCallActive(false);
    setShowCompleteModal(true);
  };

  // Complete consultation
  const handleComplete = async () => {
    try {
      setCompleting(true);
      await doctorAppointmentsApi.completeConsultation(appointmentId, {
        notes: consultationNotes,
      });
      setShowCompleteModal(false);
      navigate('/doctor/consultations', {
        state: { message: 'Consultation completed successfully!' },
      });
    } catch (err) {
      console.error('Failed to complete:', err);
      setError(err.response?.data?.message || 'Failed to complete consultation');
    } finally {
      setCompleting(false);
    }
  };

  // Format elapsed time
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      jitsiContainerRef.current?.parentElement?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <FaSpinner className="animate-spin text-emerald-500 text-4xl mb-4" />
        <p className="text-gray-500 font-medium">Loading consultation...</p>
      </div>
    );
  }

  // Error state
  if (error && !meetingInfo) {
    return (
      <div className="max-w-lg mx-auto mt-16">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <FaExclamationTriangle className="text-red-500 text-3xl mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={() => navigate('/doctor/appointments/schedule')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Back to Schedule
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header Bar */}
      <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/doctor/appointments/schedule')}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <FaArrowLeft size={14} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaVideo className="text-emerald-500" />
              Video Consultation
            </h1>
            {meetingInfo?.patient_id && (
              <p className="text-sm text-gray-500">
                Patient: {meetingInfo.patient_id.fullName || meetingInfo.patient_id.first_name || 'Patient'}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {callActive && (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-mono font-medium text-red-600">
                  {formatTime(elapsed)}
                </span>
              </div>
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <FaCompress size={14} /> : <FaExpand size={14} />}
              </button>
              <button
                onClick={handleEndCall}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <FaPhoneSlash size={12} />
                End Call
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-center gap-2">
          <FaExclamationTriangle />
          {error}
        </div>
      )}

      {/* Pre-Call Screen */}
      {!callActive && !callEnded && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 px-8 py-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <FaVideo className="text-white text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Ready to Consult?</h2>
            <p className="text-emerald-100 text-sm max-w-md mx-auto">
              Start a secure video consultation with your patient. The call will be powered by Jitsi Meet.
            </p>
          </div>

          <div className="p-8">
            {/* Patient Info */}
            {meetingInfo?.patient_id && (
              <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 overflow-hidden">
                  {meetingInfo.patient_id.profile_img_url ? (
                    <img
                      src={meetingInfo.patient_id.profile_img_url}
                      alt="Patient"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUser />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {meetingInfo.patient_id.fullName || meetingInfo.patient_id.first_name || 'Patient'}
                  </p>
                  <p className="text-sm text-gray-500">{meetingInfo.patient_id.email || ''}</p>
                </div>
              </div>
            )}

            {/* Quick Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: FaVideo, label: 'Camera Ready', desc: 'Ensure camera is working' },
                { icon: FaMicrophone, label: 'Microphone Ready', desc: 'Test audio before joining' },
                { icon: FaStethoscope, label: 'Patient Notes', desc: 'Review history before call' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">
                    <item.icon size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={handleStartCall}
                disabled={starting}
                className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all text-base font-semibold shadow-lg shadow-emerald-200 flex items-center gap-3 mx-auto disabled:opacity-50"
              >
                {starting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <FaVideo size={18} />
                    Start Video Call
                  </>
                )}
              </button>
              <p className="text-xs text-gray-400 mt-3">
                Powered by Jitsi Meet • End-to-end encrypted
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Active Call - Jitsi Container */}
      {callActive && !callEnded && (
        <div className="bg-[#0f2b3d] rounded-2xl overflow-hidden shadow-xl border border-gray-700">
          <div
            ref={jitsiContainerRef}
            style={{ height: '70vh', minHeight: '500px' }}
            className="w-full"
          />
        </div>
      )}

      {/* Complete Consultation Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5">
              <div className="flex items-center gap-3 text-white">
                <FaCheckCircle size={20} />
                <div>
                  <h3 className="text-lg font-bold">Complete Consultation</h3>
                  <p className="text-emerald-100 text-sm">
                    Call Duration: {formatTime(elapsed)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaNotesMedical className="text-emerald-500" />
                  Consultation Notes
                </label>
                <textarea
                  value={consultationNotes}
                  onChange={(e) => setConsultationNotes(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none text-sm"
                  placeholder="Add diagnosis, recommendations, follow-up instructions..."
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  navigate('/doctor/appointments/schedule');
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                Skip & Go Back
              </button>
              <button
                onClick={handleComplete}
                disabled={completing}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {completing ? (
                  <>
                    <FaSpinner className="animate-spin" size={12} />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaCheckCircle size={12} />
                    Complete Consultation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

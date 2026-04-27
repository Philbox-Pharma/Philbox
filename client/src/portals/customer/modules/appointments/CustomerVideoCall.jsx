import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaVideo,
  FaArrowLeft,
  FaSpinner,
  FaExclamationTriangle,
  FaUserMd,
  FaPhoneSlash,
  FaExpand,
  FaCompress,
  FaCheckCircle,
} from 'react-icons/fa';
import appointmentsService from '../../../../core/api/customer/appointments.service';
import { useAuth } from '../../../../shared/context/AuthContext';

export default function CustomerVideoCall() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Customer details

  const [loading, setLoading] = useState(true);
  const [meetingInfo, setMeetingInfo] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [waitingForDoctor, setWaitingForDoctor] = useState(false);

  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const timerRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Fetch meeting info
  const fetchMeetingInfo = useCallback(async () => {
    try {
      const response = await appointmentsService.getMeetingInfo(id);
      const data = response.data?.data || response.data || response;
      setMeetingInfo(data);

      // If already in-progress with a meeting link, we can join
      if (data.status === 'in-progress' && data.meeting_link) {
        setWaitingForDoctor(false);
      } else if (data.status === 'pending') {
        setWaitingForDoctor(true);
      } else if (data.status === 'completed') {
        setError('This consultation has already been completed.');
      } else if (data.status === 'missed') {
        setError('This consultation was marked as missed.');
      }
      return data;
    } catch (err) {
      console.error('Failed to fetch meeting info:', err);
      if (err.response?.status === 404) {
         setError('Appointment not found or not accepted yet.');
      } else {
         setError(err.response?.data?.message || 'Failed to load appointment details');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMeetingInfo();
  }, [fetchMeetingInfo]);

  // Poll for status if waiting for doctor
  useEffect(() => {
    if (waitingForDoctor && !callActive && !callEnded) {
      pollIntervalRef.current = setInterval(async () => {
        const data = await fetchMeetingInfo();
        if (data?.status === 'in-progress' && data?.meeting_link) {
          setWaitingForDoctor(false);
          clearInterval(pollIntervalRef.current);
        }
      }, 5000); // Check every 5 seconds
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [waitingForDoctor, callActive, callEnded, fetchMeetingInfo]);

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
          DEFAULT_BACKGROUND: '#ffffff',
          TOOLBAR_ALWAYS_VISIBLE: true,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          MOBILE_APP_PROMO: false,
          HIDE_INVITE_MORE_HEADER: true,
        },
        userInfo: {
          displayName: user?.fullName || user?.first_name ? `${user.first_name} ${user.last_name}` : 'Patient',
          email: user?.email || '',
        },
      };

      try {
        // eslint-disable-next-line no-undef
        const api = new JitsiMeetExternalAPI(domain, options);
        jitsiApiRef.current = api;

        api.addEventListener('readyToClose', () => {
          handleEndCall();
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
  }, [callActive, callEnded, meetingInfo, user]);

  // Join consultation
  const handleJoinCall = () => {
    if (meetingInfo?.status === 'in-progress' && meetingInfo?.meeting_link) {
      setCallActive(true);
    } else {
      setError('Doctor has not started the call yet.');
    }
  };

  // End call
  const handleEndCall = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
      jitsiApiRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setCallEnded(true);
    setCallActive(false);
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

  // Doctor Name helper
  const doctorName = meetingInfo?.doctor_id 
    ? `Dr. ${meetingInfo.doctor_id.first_name || ''} ${meetingInfo.doctor_id.last_name || ''}`.trim()
    : 'Doctor';

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <FaSpinner className="animate-spin text-blue-500 text-4xl mb-4" />
        <p className="text-gray-500 font-medium">Loading consultation...</p>
      </div>
    );
  }

  // Error state
  if (error && !meetingInfo && !callEnded) {
    return (
      <div className="max-w-lg mx-auto mt-16 px-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <FaExclamationTriangle className="text-red-500 text-3xl mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={() => navigate('/appointments')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  // Post-Call State
  if (callEnded) {
    return (
      <div className="max-w-lg mx-auto mt-16 px-4">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
          <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Call Ended</h2>
          <p className="text-gray-500 mb-6">
            Your video consultation with {doctorName} has ended. Duration: {formatTime(elapsed)}.
          </p>
          <button
            onClick={() => navigate('/appointments')}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      {/* Header Bar */}
      <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/appointments')}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <FaArrowLeft size={14} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaVideo className="text-blue-500" />
              Video Consultation
            </h1>
            <p className="text-sm text-gray-500">
              {doctorName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {callActive && (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full hidden sm:flex">
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
                Leave Call
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && !callEnded && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-center gap-2">
          <FaExclamationTriangle />
          {error}
        </div>
      )}

      {/* Pre-Call Screen */}
      {!callActive && !callEnded && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <FaVideo className="text-white text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Video Consultation</h2>
            <p className="text-blue-100 text-sm max-w-md mx-auto">
              You are about to join a secure video call with {doctorName}.
            </p>
          </div>

          <div className="p-8">
            {/* Doctor Info */}
            <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 mb-8">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl flex-shrink-0 overflow-hidden border-2 border-white shadow-sm">
                {meetingInfo?.doctor_id?.profile_picture ? (
                  <img
                    src={meetingInfo.doctor_id.profile_picture}
                    alt={doctorName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUserMd />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{doctorName}</p>
                <p className="text-sm text-blue-600">
                  {meetingInfo?.doctor_id?.specialization 
                    ? (Array.isArray(meetingInfo.doctor_id.specialization) ? meetingInfo.doctor_id.specialization.join(', ') : meetingInfo.doctor_id.specialization) 
                    : 'Doctor'}
                </p>
              </div>
            </div>

            <div className="text-center">
              {waitingForDoctor ? (
                <div className="inline-flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-700 font-medium mb-1">Waiting for {doctorName} to join...</p>
                  <p className="text-sm text-gray-500">The call will automatically start when the doctor connects.</p>
                </div>
              ) : (
                <button
                  onClick={handleJoinCall}
                  className="px-8 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-base font-semibold shadow-lg shadow-blue-200 flex items-center gap-3 mx-auto"
                >
                  <FaVideo size={18} />
                  Join Video Call
                </button>
              )}
              <p className="text-xs text-gray-400 mt-6">
                Powered by Jitsi Meet • End-to-end encrypted
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Active Call - Jitsi Container */}
      {callActive && !callEnded && (
        <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-sm border border-gray-200">
          <div
            ref={jitsiContainerRef}
            style={{ height: '70vh', minHeight: '500px' }}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}

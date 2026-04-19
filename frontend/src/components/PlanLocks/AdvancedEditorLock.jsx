import { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaLock, FaCrown, FaRocket, FaEdit, FaFeatherAlt, FaImage, FaPalette, FaCode, FaTable, FaVideo } from 'react-icons/fa';
import { hasAdvancedEditor, getRequiredPlanForFeature, PLAN_TIERS } from '../../utils/planUtils';

const AdvancedEditorLock = ({ userPlan, children, isActive = false }) => {
  const [showFeatures, setShowFeatures] = useState(false);
  const hasAccess = hasAdvancedEditor(userPlan);
  const requiredPlan = getRequiredPlanForFeature('advancedEditor');

  if (hasAccess) {
    return children;
  }

  const advancedFeatures = [
    { icon: FaEdit, name: 'Rich Text Formatting', description: 'Bold, italic, underline, strikethrough' },
    { icon: FaPalette, name: 'Text Colors & Highlights', description: 'Custom colors and background highlights' },
    { icon: FaImage, name: 'Advanced Image Tools', description: 'Image alignment, captions, and resizing' },
    { icon: FaCode, name: 'Code Blocks', description: 'Syntax highlighting for multiple languages' },
    { icon: FaTable, name: 'Tables & Lists', description: 'Advanced table creation and list formatting' },
    { icon: FaFeatherAlt, name: 'Custom Fonts', description: 'Access to premium font families' },
    { icon: FaVideo, name: 'Media Embedding', description: 'Embed videos, tweets, and other media' }
  ];

  return (
    <div className="relative">
      {/* Locked Editor Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-purple-900/90  flex items-center justify-center z-10 backdrop-blur-sm">
        <div className="text-center text-white p-6 max-w-md">
          <div className="mb-4">
            <FaLock className="mx-auto text-4xl mb-2 animate-pulse" />
            {requiredPlan === PLAN_TIERS.PREMIUM ? (
              <FaRocket className="mx-auto text-3xl text-blue-400" />
            ) : (
              <FaCrown className="mx-auto text-3xl text-purple-400" />
            )}
          </div>
          
          <h3 className="text-xl font-bold mb-2">Advanced Text Editor</h3>
          <p className="text-blue-100 mb-4">
            Unlock powerful editing tools to create beautiful, engaging content
          </p>

          <button
            onClick={() => setShowFeatures(!showFeatures)}
            className="text-sm text-blue-200 hover:text-white mb-4 underline transition-colors"
          >
            {showFeatures ? 'Hide' : 'Show'} advanced features
          </button>

          {showFeatures && (
            <div className="bg-white/10  p-4 mb-4 text-left">
              <h4 className="font-semibold mb-3 text-center">What you&apos;ll get:</h4>
              <div className="space-y-2">
                {advancedFeatures.slice(0, 4).map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={index} className="flex items-start space-x-2">
                      <IconComponent className="text-blue-300 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-sm">{feature.name}</div>
                        <div className="text-xs text-blue-200">{feature.description}</div>
                      </div>
                    </div>
                  );
                })}
                <div className="text-center text-xs text-blue-200 pt-2">
                  + {advancedFeatures.length - 4} more features
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Link
              to="/dashboard/billing"
              className={`block w-full py-3 px-6  font-medium transition-all transform hover:scale-105 ${
                requiredPlan === PLAN_TIERS.PREMIUM
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              Upgrade to {requiredPlan}
            </Link>
            
            <div className="text-xs text-blue-200">
              {requiredPlan === PLAN_TIERS.PREMIUM ? (
                <>
                  <div>✨ Enhanced features</div>
                  <div>📝 Advanced editor</div>
                </>
              ) : (
                <>
                  <div>🚀 Premium features</div>
                  <div>📊 Advanced tools</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Blurred Basic Editor (visible underneath) */}
      <div className={`filter ${isActive ? 'blur-md' : 'blur-sm'} pointer-events-none opacity-50`}>
        {children}
      </div>
    </div>
  );
};

AdvancedEditorLock.propTypes = {
  userPlan: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  isActive: PropTypes.bool
};

export default AdvancedEditorLock;

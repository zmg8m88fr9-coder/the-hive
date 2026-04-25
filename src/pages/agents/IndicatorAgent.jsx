import { useParams, Link } from 'react-router-dom';
import { INDICATOR_AGENTS } from '../../lib/indicatorAgents';
import IndicatorAgentBase from '../../components/hive/IndicatorAgentBase';

export default function IndicatorAgent() {
  const { indicatorId } = useParams();
  const indicator = INDICATOR_AGENTS[indicatorId];

  if (!indicator) {
    return (
      <div className="p-4 pt-8">
        <Link to="/indicators">
          <div className="text-[#FFB81C] text-sm mb-4">← INDICATORS</div>
        </Link>
        <div className="text-[#6b6860] text-xs">Indicator agent <span className="text-[#d4d0c8]">{indicatorId}</span> not found.</div>
      </div>
    );
  }

  return <IndicatorAgentBase indicator={indicator} />;
}

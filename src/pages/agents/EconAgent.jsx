import MarketAgentBase from '../../components/hive/MarketAgentBase';
import { MARKET_AGENTS } from '../../lib/marketAgents';

export default function EconAgent() {
  return <MarketAgentBase config={MARKET_AGENTS.econ} />;
}

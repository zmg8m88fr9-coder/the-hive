import MarketAgentBase from '../../components/hive/MarketAgentBase';
import { MARKET_AGENTS } from '../../lib/marketAgents';

export default function ForexAgent() {
  return <MarketAgentBase config={MARKET_AGENTS.forex} />;
}

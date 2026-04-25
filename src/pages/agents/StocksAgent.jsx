import MarketAgentBase from '../../components/hive/MarketAgentBase';
import { MARKET_AGENTS } from '../../lib/marketAgents';

export default function StocksAgent() {
  return <MarketAgentBase config={MARKET_AGENTS.stocks} />;
}

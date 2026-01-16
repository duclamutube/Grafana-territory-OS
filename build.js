const fs = require('fs');
const path = require('path');

const summaryPath = path.join(__dirname, 'summary.md');
const templatePath = path.join(__dirname, 'template.html');
const outputPath = path.join(__dirname, 'index.html');

const summaryContent = fs.readFileSync(summaryPath, 'utf8');
const templateContent = fs.readFileSync(templatePath, 'utf8');

function parseMarkdown(content) {
  const lines = content.split('\n');
  const data = {
    lastUpdated: '',
    sdr: '',
    totalAccounts: '',
    accounts: []
  };

  let currentAccount = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Parse header info
    if (trimmed.startsWith('Last Updated:')) {
      data.lastUpdated = trimmed.replace('Last Updated:', '').trim();
    } else if (trimmed.startsWith('SDR:')) {
      data.sdr = trimmed.replace('SDR:', '').trim();
    } else if (trimmed.startsWith('Total Accounts:')) {
      data.totalAccounts = trimmed.replace('Total Accounts:', '').trim();
    }

    // Parse account headers
    else if (trimmed.startsWith('### ')) {
      if (currentAccount) {
        data.accounts.push(currentAccount);
      }
      currentAccount = {
        name: trimmed.replace('### ', '').trim(),
        score: 0,
        tier: '',
        status: '',
        outreachStart: '',
        revisit: '',
        angle: '',
        signals: '',
        whyNow: '',
        whyNowSource: '',
        whyGrafana: '',
        whyGrafanaSource: '',
        whyAnything: '',
        whyAnythingSource: '',
        outcome: '',
        dataFreshness: '',
        dataWarning: '',
        topContacts: '',
        competitive: '',
        blocker: ''
      };
    }

    // Parse account fields
    else if (currentAccount && trimmed.startsWith('- ')) {
      const fieldLine = trimmed.replace('- ', '');
      const colonIndex = fieldLine.indexOf(':');
      if (colonIndex > -1) {
        const key = fieldLine.substring(0, colonIndex).trim();
        const value = fieldLine.substring(colonIndex + 1).trim();

        switch (key) {
          case 'Score': currentAccount.score = parseInt(value) || 0; break;
          case 'Tier': currentAccount.tier = value; break;
          case 'Status': currentAccount.status = value; break;
          case 'Outreach Start': currentAccount.outreachStart = value; break;
          case 'Revisit': currentAccount.revisit = value; break;
          case 'Angle': currentAccount.angle = value; break;
          case 'Signals': currentAccount.signals = value; break;
          case 'Why NOW': currentAccount.whyNow = value; break;
          case 'Why NOW Source': currentAccount.whyNowSource = value; break;
          case 'Why GRAFANA': currentAccount.whyGrafana = value; break;
          case 'Why GRAFANA Source': currentAccount.whyGrafanaSource = value; break;
          case 'Why ANYTHING': currentAccount.whyAnything = value; break;
          case 'Why ANYTHING Source': currentAccount.whyAnythingSource = value; break;
          case 'Outcome': currentAccount.outcome = value; break;
          case 'Data Freshness': currentAccount.dataFreshness = value; break;
          case 'Data Warning': currentAccount.dataWarning = value; break;
          case 'Top Contacts': currentAccount.topContacts = value; break;
          case 'Competitive': currentAccount.competitive = value; break;
          case 'Blocker': currentAccount.blocker = value; break;
        }
      }
    }
  }

  if (currentAccount) {
    data.accounts.push(currentAccount);
  }

  return data;
}

function generateAccountCards(accounts) {
  return accounts.map((account, index) => {
    const tierClass = getTierClass(account.tier);
    const tierEmoji = getTierEmoji(account.tier);
    const freshnessClass = getFreshnessClass(account.dataFreshness);
    const hasBlocker = account.blocker && account.blocker !== 'None';
    const signalsHtml = formatSignals(account.signals);
    const contactsHtml = formatContacts(account.topContacts);

    return `
      <div class="account-card ${tierClass}" data-index="${index}">
        <div class="card-collapsed" onclick="toggleCard(${index})">
          <div class="card-header">
            <div class="card-title">
              <span class="account-name">${account.name}</span>
              <span class="account-score">${account.score}</span>
            </div>
            <div class="card-meta">
              <span class="tier-badge ${tierClass}">${tierEmoji} T${account.tier}</span>
              <span class="status-badge">${account.status}</span>
              <span class="freshness-badge ${freshnessClass}">${account.dataFreshness}</span>
            </div>
          </div>
          
          <div class="angle-section">
            <div class="section-label">RECOMMENDED ANGLE</div>
            <div class="angle-text">"${account.angle}"</div>
          </div>
          
          <div class="signals-section">
            <div class="section-label">KEY SIGNALS</div>
            <div class="signals-list">${signalsHtml}</div>
          </div>

          ${hasBlocker ? `<div class="blocker-banner">⚠️ ${account.blocker}</div>` : ''}
          
          <div class="expand-hint">Click to expand details ▼</div>
        </div>
        
        <div class="card-expanded" id="expanded-${index}">
          <div class="three-whys-grid">
            <div class="why-card">
              <div class="why-header">WHY NOW</div>
              <div class="why-content">${account.whyNow}</div>
              <div class="why-source">${account.whyNowSource}</div>
            </div>
            <div class="why-card">
              <div class="why-header">WHY GRAFANA</div>
              <div class="why-content">${account.whyGrafana}</div>
              <div class="why-source">${account.whyGrafanaSource}</div>
            </div>
            <div class="why-card">
              <div class="why-header">WHY ANYTHING</div>
              <div class="why-content">${account.whyAnything}</div>
              <div class="why-source">${account.whyAnythingSource}</div>
            </div>
          </div>
          
          <div class="details-grid">
            <div class="detail-section">
              <div class="detail-label">OUTCOME FOCUS</div>
              <div class="detail-content">${account.outcome}</div>
            </div>
            
            <div class="detail-section">
              <div class="detail-label">TOP CONTACTS</div>
              <div class="detail-content contacts-list">${contactsHtml}</div>
            </div>
            
            <div class="detail-section">
              <div class="detail-label">COMPETITIVE LANDSCAPE</div>
              <div class="detail-content">${account.competitive}</div>
            </div>
            
            ${account.dataWarning && account.dataWarning !== 'None' ? `
            <div class="detail-section warning">
              <div class="detail-label">⚠️ DATA WARNING</div>
              <div class="detail-content">${account.dataWarning}</div>
            </div>
            ` : ''}
            
            ${account.outreachStart ? `
            <div class="detail-section">
              <div class="detail-label">OUTREACH TIMING</div>
              <div class="detail-content">Started: ${account.outreachStart} | Revisit: ${account.revisit || 'TBD'}</div>
            </div>
            ` : ''}
          </div>
          
          <div class="collapse-hint" onclick="toggleCard(${index})">Click to collapse ▲</div>
        </div>
      </div>
    `;
  }).join('\n');
}

function formatSignals(signals) {
  if (!signals) return '';
  return signals.split(' | ').map(signal => `<span class="signal-tag">🔥 ${signal}</span>`).join('');
}

function formatContacts(contacts) {
  if (!contacts) return '';
  return contacts.split(' | ').map(contact => `<div class="contact-item">👤 ${contact}</div>`).join('');
}

function getTierClass(tier) {
  const t = String(tier);
  if (t === '1') return 'tier-1';
  if (t === '2') return 'tier-2';
  if (t === '3') return 'tier-3';
  if (t.toLowerCase() === 'nurture') return 'tier-nurture';
  return 'tier-4';
}

function getTierEmoji(tier) {
  const t = String(tier);
  if (t === '1') return '🔥';
  if (t === '2') return '🔶';
  if (t === '3') return '🔷';
  if (t.toLowerCase() === 'nurture') return '🌱';
  return '⬜';
}

function getFreshnessClass(freshness) {
  if (freshness === 'HIGH') return 'freshness-high';
  if (freshness === 'MEDIUM') return 'freshness-medium';
  return 'freshness-low';
}

// Main execution
const data = parseMarkdown(summaryContent);
const accountCardsHtml = generateAccountCards(data.accounts);

const tier1Count = data.accounts.filter(a => String(a.tier) === '1').length;
const tier2Count = data.accounts.filter(a => String(a.tier) === '2').length;
const tier3Count = data.accounts.filter(a => String(a.tier) === '3').length;
const nurtureCount = data.accounts.filter(a => String(a.tier).toLowerCase() === 'nurture').length;

let outputHtml = templateContent
  .replace('{{LAST_UPDATED}}', data.lastUpdated)
  .replace('{{SDR}}', data.sdr)
  .replace('{{TOTAL_ACCOUNTS}}', data.totalAccounts)
  .replace('{{TIER1_COUNT}}', tier1Count)
  .replace('{{TIER2_COUNT}}', tier2Count)
  .replace('{{TIER3_COUNT}}', tier3Count)
  .replace('{{NURTURE_COUNT}}', nurtureCount)
  .replace('{{ACCOUNT_CARDS}}', accountCardsHtml);

fs.writeFileSync(outputPath, outputHtml);
console.log('✅ Dashboard v2 built successfully!');
console.log(`   Accounts: ${data.accounts.length}`);
console.log(`   Tier 1: ${tier1Count}, Tier 2: ${tier2Count}, Tier 3: ${tier3Count}, Nurture: ${nurtureCount}`);

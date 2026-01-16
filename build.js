const fs = require('fs');
const path = require('path');

// Read the summary markdown file
const summaryPath = path.join(__dirname, 'summary.md');
const templatePath = path.join(__dirname, 'template.html');
const outputPath = path.join(__dirname, 'index.html');

const summaryContent = fs.readFileSync(summaryPath, 'utf8');
const templateContent = fs.readFileSync(templatePath, 'utf8');

// Parse the markdown into structured data
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

    // Parse account headers (### Account Name)
    else if (trimmed.startsWith('### ')) {
      if (currentAccount) {
        data.accounts.push(currentAccount);
      }
      currentAccount = {
        name: trimmed.replace('### ', '').trim(),
        score: 0,
        tier: 0,
        status: '',
        outreachStart: '',
        revisit: '',
        whyNow: '',
        whyGrafana: '',
        whyAnything: '',
        dataFreshness: '',
        outcome: ''
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
          case 'Why NOW': currentAccount.whyNow = value; break;
          case 'Why GRAFANA': currentAccount.whyGrafana = value; break;
          case 'Why ANYTHING': currentAccount.whyAnything = value; break;
          case 'Data Freshness': currentAccount.dataFreshness = value; break;
          case 'Outcome': currentAccount.outcome = value; break;
        }
      }
    }
  }

  // Don't forget the last account
  if (currentAccount) {
    data.accounts.push(currentAccount);
  }

  return data;
}

// Generate HTML for account cards
function generateAccountCards(accounts) {
  return accounts.map(account => {
    const tierClass = getTierClass(account.tier);
    const tierEmoji = getTierEmoji(account.tier);
    const freshnessClass = getFreshnessClass(account.dataFreshness);

    return `
      <div class="account-card ${tierClass}">
        <div class="account-header">
          <div class="account-name">${account.name}</div>
          <div class="account-score">${account.score}</div>
        </div>
        <div class="account-tier">${tierEmoji} Tier ${account.tier}</div>
        <div class="account-status">Status: ${account.status}</div>
        ${account.outreachStart ? `<div class="account-dates">Outreach: ${account.outreachStart} | Revisit: ${account.revisit || 'TBD'}</div>` : ''}
        
        <div class="three-whys">
          <div class="why-section">
            <div class="why-label">Why NOW</div>
            <div class="why-content">${account.whyNow}</div>
          </div>
          <div class="why-section">
            <div class="why-label">Why GRAFANA</div>
            <div class="why-content">${account.whyGrafana}</div>
          </div>
          <div class="why-section">
            <div class="why-label">Why ANYTHING</div>
            <div class="why-content">${account.whyAnything}</div>
          </div>
        </div>
        
        <div class="account-footer">
          <div class="outcome"><strong>Outcome:</strong> ${account.outcome}</div>
          <div class="freshness ${freshnessClass}">Data: ${account.dataFreshness}</div>
        </div>
      </div>
    `;
  }).join('\n');
}

function getTierClass(tier) {
  const tierNum = typeof tier === 'string' ? parseInt(tier) || tier : tier;
  if (tierNum === 1 || tierNum === '1') return 'tier-1';
  if (tierNum === 2 || tierNum === '2') return 'tier-2';
  if (tierNum === 3 || tierNum === '3') return 'tier-3';
  if (tier === 'Nurture' || tierNum === 'Nurture') return 'tier-nurture';
  return 'tier-4';
}

function getTierEmoji(tier) {
  const tierNum = typeof tier === 'string' ? parseInt(tier) || tier : tier;
  if (tierNum === 1 || tierNum === '1') return '🔥';
  if (tierNum === 2 || tierNum === '2') return '🔶';
  if (tierNum === 3 || tierNum === '3') return '🔷';
  if (tier === 'Nurture' || tierNum === 'Nurture') return '🌱';
  return '⬜';
}

function getFreshnessClass(freshness) {
  if (freshness === 'HIGH') return 'freshness-high';
  if (freshness === 'MEDIUM') return 'freshness-medium';
  return 'freshness-low';
}

// Main execution
const data = parseMarkdown(summaryContent);

// Generate account cards HTML
const accountCardsHtml = generateAccountCards(data.accounts);

// Count tiers
const tier1Count = data.accounts.filter(a => a.tier == 1 || a.tier === '1').length;
const tier2Count = data.accounts.filter(a => a.tier == 2 || a.tier === '2').length;
const tier3Count = data.accounts.filter(a => a.tier == 3 || a.tier === '3').length;
const nurtureCount = data.accounts.filter(a => a.tier === 'Nurture').length;

// Replace placeholders in template
let outputHtml = templateContent
  .replace('{{LAST_UPDATED}}', data.lastUpdated)
  .replace('{{SDR}}', data.sdr)
  .replace('{{TOTAL_ACCOUNTS}}', data.totalAccounts)
  .replace('{{TIER1_COUNT}}', tier1Count)
  .replace('{{TIER2_COUNT}}', tier2Count)
  .replace('{{TIER3_COUNT}}', tier3Count)
  .replace('{{NURTURE_COUNT}}', nurtureCount)
  .replace('{{ACCOUNT_CARDS}}', accountCardsHtml);

// Write output
fs.writeFileSync(outputPath, outputHtml);
console.log('✅ Dashboard built successfully!');
console.log(`   Accounts processed: ${data.accounts.length}`);
console.log(`   Tier 1: ${tier1Count}, Tier 2: ${tier2Count}, Tier 3: ${tier3Count}, Nurture: ${nurtureCount}`);

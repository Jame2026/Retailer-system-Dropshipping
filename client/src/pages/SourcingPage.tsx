import React, { useState, useEffect, useMemo } from 'react';
import { PageContainer } from '../components/layout/PageContainer.js';
import { sourcingService } from '../services/sourcingService.js';
import { useNotification } from '../context/NotificationContext.js';
import { Button } from '../components/common/Button.js';
import { Clock, RefreshCw } from 'lucide-react';
import { SourcingHowItWorks } from '../components/modules/sourcing/SourcingHowItWorks.js';
import { SourcingSummaryStats } from '../components/modules/sourcing/SourcingSummaryStats.js';
import { SourcingFormCard } from '../components/modules/sourcing/SourcingFormCard.js';
import { SourcingHistoryList } from '../components/modules/sourcing/SourcingHistoryList.js';
import { SourcingFilterTabs, SourcingFilterType } from '../components/modules/sourcing/SourcingFilterTabs.js';
import { SourcingRequestDTO } from '../types/catalog.types.js';

export const SourcingPage: React.FC = () => {
  const { showToast } = useNotification();
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [filter, setFilter] = useState<SourcingFilterType>('all');

  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      const data = await sourcingService.listSourcingRequests();
      setRequests(data);
    } catch {
      // Keep empty if fails
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (dto: SourcingRequestDTO) => {
    try {
      setLoading(true);
      await sourcingService.submitSourcingRequest(dto);
      showToast(
        'success',
        'Sourcing Query Submitted',
        'CJ sourcing agents will contact factories and quote wholesale pricing within 24–48h.'
      );
      await fetchRequests();
    } catch (err: any) {
      showToast('error', 'Submission Failed', err.message || 'Unable to submit sourcing request.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const s = (r.status || 'PENDING').toUpperCase();
      if (filter === 'pending') return s === 'PENDING';
      if (filter === 'sourcing') return s === 'SOURCING';
      if (filter === 'sourced') return s === 'SOURCED' || s === 'SUCCESS';
      return true;
    });
  }, [requests, filter]);

  const filterCounts = useMemo(() => ({
    all: requests.length,
    pending: requests.filter((r) => !r.status || r.status === 'PENDING').length,
    sourcing: requests.filter((r) => r.status === 'SOURCING').length,
    sourced: requests.filter((r) => r.status === 'SOURCED' || r.status === 'SUCCESS').length,
  }), [requests]);

  return (
    <PageContainer
      title="Custom Product Sourcing"
      subtitle="Request CJ Dropshipping agents to source any product from AliExpress, 1688, Amazon, or TikTok at factory wholesale prices"
    >
      <SourcingHowItWorks />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <SourcingFormCard onSubmit={handleSubmit} loading={loading} />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <SourcingSummaryStats requests={requests} />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Sourcing History {requests.length > 0 && `(${requests.length})`}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <SourcingFilterTabs
                currentFilter={filter}
                onFilterChange={setFilter}
                counts={filterCounts}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchRequests}
                disabled={loadingRequests}
                className="text-xs shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingRequests ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          <SourcingHistoryList requests={filteredRequests} loading={loadingRequests} />
        </div>
      </div>
    </PageContainer>
  );
};

export type LockData = {
  lockedAmount: string;
  withdrawnAmount: string;
  totalLockedAmount: string;
  unlockedAmount?: string;
  upcomingUnlockDate?: Date;
};

export type AllChainLocks = {
  chainName: string;
  lockedData: LockDataStats;
}[];

export type LockDataStats = {
  activeLockedAmount: any;
  totalLockedAmount: any;
  totalWithdrawnAmount: any;
};

export type DataByChainName = { [chainName: string]: any };

export type Stats = {
  activeLockedAmount: number;
  totalLockedAmount: number;
  totalWithdrawnAmount: number;
};

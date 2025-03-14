// src/store/portfolioSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Asset {
	id: string;
	name: string;
	amount: number;
	price: number;
	total: number;
	change24h: number;
	share: number;
}

interface PortfolioState {
	assets: Asset[];
	totalPortfolioValue: number;
}

const initialState: PortfolioState = {
	assets: JSON.parse(localStorage.getItem('portfolio') || '[]'),
	totalPortfolioValue: 0,
}

const calculateShares = (assets: Asset[]) => {
	const totalValue = assets.reduce((sum, asset) => sum + asset.total, 0)
	return assets.map(asset => ({
		...asset,
		share: totalValue ? (asset.total / totalValue) * 100 : 0
	}))
}

const portfolioSlice = createSlice({
	name: 'portfolio',
	initialState,
	reducers: {
		addAsset: (state, action: PayloadAction<Asset>) => {
			state.assets.push(action.payload)
			state.assets = calculateShares(state.assets)
			state.totalPortfolioValue = state.assets.reduce((sum, asset) => sum + asset.total, 0)
			localStorage.setItem('portfolio', JSON.stringify(state.assets))
		},
		removeAsset: (state, action: PayloadAction<string>) => {
			state.assets = state.assets.filter(asset => asset.id !== action.payload)
			state.assets = calculateShares(state.assets)
			state.totalPortfolioValue = state.assets.reduce((sum, asset) => sum + asset.total, 0)
			localStorage.setItem('portfolio', JSON.stringify(state.assets))
		},
		updatePrices: (state, action: PayloadAction<{ id: string; price: number; change24h: number; amount?: number }[]>) => {
			state.assets = state.assets.map(asset => {
				const updated = action.payload.find(a => a.id === asset.id)
				return updated ?
					{
						...asset,
						price: updated.price,
						change24h: updated.change24h,
						amount: updated.amount ?? asset.amount ,
						total: asset.amount * updated.price
					} : asset
			})
			state.assets = calculateShares(state.assets)
			state.totalPortfolioValue = state.assets.reduce((sum, asset) => sum + asset.total, 0)
			localStorage.setItem('portfolio', JSON.stringify(state.assets))
		}
	},
})

export const { addAsset, removeAsset, updatePrices } = portfolioSlice.actions
export default portfolioSlice.reducer

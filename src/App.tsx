import {FC, useEffect, useState} from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "./store/store"
import { addAsset, removeAsset, updatePrices } from "./store/PortfolioSlice"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { FixedSizeList as List } from "react-window"
import axios from "axios"
import "./App.scss"
import Modal from "./components/Modal.tsx"

interface CryptoAsset {
    value: string;
    label: string;
    price: number;
    change24h: number;
}

interface PortfolioAsset {
    id: string;
    name: string;
    amount: number;
    price: number;
    total: number;
    change24h: number;
    share: number;
}

const App: FC = () => {
    const dispatch = useDispatch()
    const assets = useSelector((state: RootState) => state.portfolio.assets) as PortfolioAsset[]
    const totalPortfolioValue = assets.reduce((sum, asset) => sum + asset.total, 0)
    const [cryptoOptions, setCryptoOptions] = useState<CryptoAsset[]>([])
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const response = await axios.get("https://api.binance.com/api/v3/ticker/24hr")
                const options: CryptoAsset[] = response.data
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    .filter((item) => item.symbol.endsWith("USDT"))
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    .map((item) => ({
                        value: item.symbol.replace("USDT", ""),
                        label: item.symbol.replace("USDT", ""),
                        price: parseFloat(item.lastPrice),
                        change24h: parseFloat(item.priceChangePercent),
                    }))
                setCryptoOptions(options)
            } catch (error) {
                console.error("Ошибка загрузки списка активов:", error)
            }
        }

        fetchAssets()
    }, [])

    useEffect(() => {
        if (assets.length === 0) return

        const streams = assets.map(asset => `${asset.id.toLowerCase()}usdt@ticker`).join("/")
        const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`)

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)
            if (!data || !data.data) return

            const { s, c, P } = data.data
            const symbol = s.replace("USDT", "")

            dispatch(updatePrices([{ id: symbol, price: parseFloat(c), change24h: parseFloat(P) }]))
        }

        return () => ws.close()
    }, [assets, dispatch])

    const handleRemoveAsset = (id: string) => {
        dispatch(removeAsset(id))
    }

    const handleAddAsset = (selectedAsset: CryptoAsset, amount: number) => {
        if (!selectedAsset || amount <= 0) return

        const existingAsset = assets.find(asset => asset.id === selectedAsset.value)
        if (existingAsset) {
            const updatedAssets = assets.map(asset =>
                asset.id === selectedAsset.value
                    ? {
                        ...asset,
                        amount: asset.amount + amount,
                        total: (asset.amount + amount) * asset.price,
                    }
                    : asset
            )
            dispatch(updatePrices(updatedAssets))
        } else {
            const total = selectedAsset.price * amount

            dispatch(
                addAsset({
                    id: selectedAsset.value,
                    name: selectedAsset.label,
                    amount,
                    price: selectedAsset.price,
                    total,
                    change24h: selectedAsset.change24h,
                    share: 0,
                })
            )
        }
    }

    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const asset = assets[index]

        return (
            <div
                key={asset.id}
                style={style}
                className="portfolio__table--row"
                tabIndex={0}
                onClick={() => handleRemoveAsset(asset.id)}
                onKeyDown={(e) => {if (e.key === "Enter") handleRemoveAsset(asset.id)}}
            >
                <span>{asset.id}</span>
                <span>{asset.amount}</span>
                <span aria-live="polite">${asset.price.toFixed(2)}</span>
                <span aria-live="polite">${asset.total.toFixed(2)}</span>
                <span
                    aria-live="polite"
                    className={`portfolio__change ${asset.change24h >= 0 ? "green" : "red"}`}
                >
                    {asset.change24h.toFixed(2)}%
                </span>
                <span aria-live="polite">{asset.share?.toFixed(2)}%</span>
            </div>
        )
    }

    return (
        <div className="portfolio">
            <h1>Portfolio Overview</h1>
            <h2>Total Value: ${totalPortfolioValue.toFixed(2)}</h2>

            <button className="portfolio__button portfolio__button--add" tabIndex={0} aria-label="Открыть модальное окно добавления актива" onClick={() => setIsModalOpen(true)}>
                Добавить актив
            </button>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={handleAddAsset}
                cryptoOptions={cryptoOptions}
            />

            {assets.length > 0 ? (
                <div className="portfolio__table" role="grid">
                    <div className="portfolio__table--header">
                        <span role="columnheader">Название</span>
                        <span role="columnheader">Кол-во</span>
                        <span role="columnheader">Цена</span>
                        <span role="columnheader">Общая стоимость</span>
                        <span role="columnheader">Изменение 24ч</span>
                        <span role="columnheader">Доля в портфеле</span>
                    </div>

                    <List
                        height={200}
                        itemCount={assets.length}
                        itemSize={40}
                        width="100%"
                    >
                        {Row}
                    </List>
                </div>
            ) : (
                <p className="portfolio__empty">Нет активов в портфеле. Добавьте что-то!</p>
            )}
        </div>
    )
}

export default App

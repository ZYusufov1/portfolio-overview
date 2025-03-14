import {FC, useRef, useState} from "react"
import "./Modal.scss"

interface CryptoAsset {
	value: string;
	label: string;
	price: number;
	change24h: number;
}

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelect: (selectedAsset: CryptoAsset, amount: number) => void;
	cryptoOptions: CryptoAsset[];
}

const Modal: FC<ModalProps> = ({ isOpen, onClose, onSelect, cryptoOptions }) => {
	const [search, setSearch] = useState<string>("")
	const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null)
	const [amount, setAmount] = useState<number>(0)
	const inputRef = useRef<HTMLInputElement | null>(null)

	if (!isOpen) return null

	const handleSelect = (asset: CryptoAsset) => {
		setSelectedAsset(asset)
		setAmount(0)
		setTimeout(() => inputRef.current?.focus(), 0)
	}

	const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			handleCloseModal()
		}
	}

	const handleCloseModal = () => {
		setSelectedAsset(null)
		onClose()
	}

	const filteredOptions = cryptoOptions.filter((crypto) =>
		crypto.label.toLowerCase().includes(search.toLowerCase())
	)

	return  (
		<div className="modal-overlay" onClick={handleOverlayClick}>
			<div className="modal">
				<h2>Поиск валюты</h2>
				<input
					className="modal__search"
					type="text"
					placeholder="Введите название..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				<div className="modal__table">
					{filteredOptions.map((crypto) => (
						<div
							tabIndex={0}
							key={crypto.value}
							className="modal__row"
							onClick={() => handleSelect(crypto)}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleSelect(crypto)
							}}
						>
							<span className="modal__name">{crypto.label}</span>
							<span className="modal__price">${crypto.price?.toFixed(2)}</span>
							<span
								className={`modal__change ${crypto.change24h >= 0 ? "green" : "red"}`}
							>
                                {crypto.change24h?.toFixed(2)}%
                            </span>
						</div>
					))}
				</div>
				{selectedAsset && (
					<div className="modal__selected">
						<h3>{selectedAsset.label}</h3>
						<span>Цена: ${selectedAsset.price?.toFixed(2)}</span>
						<input
							ref={inputRef}
							className="modal__input"
							type="number"
							placeholder="Количество"
							value={amount}
							onChange={(e) => setAmount(Number(e.target.value))}
						/>
						<div className="modal__buttons">
							<button
								className="modal__button modal__button--add"
								tabIndex={0}
								onClick={() => {
									onSelect(selectedAsset, amount)
									setSelectedAsset(null)
									setAmount(0)
									onClose()
								}}
							>
								добавить
							</button>
							<button
								tabIndex={0}
								className="modal__button modal__button--cancel"
								onClick={() => handleCloseModal()}
							>
								отмена
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default Modal

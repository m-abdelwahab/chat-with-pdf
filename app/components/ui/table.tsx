import {
	Cell as ReactAriaCell,
	Column as ReactAriaColumn,
	Row as ReactAriaRow,
	Table as ReactAriaTable,
	TableHeader as ReactAriaTableHeader,
	Button,
	type CellProps,
	Collection,
	type ColumnProps,
	ColumnResizer,
	Group,
	TableBody as ReactAriaTableBody,
	ResizableTableContainer,
	type RowProps,
	type TableHeaderProps,
	type TableProps,
	composeRenderProps,
	useTableOptions,
} from "react-aria-components";
import { Checkbox } from "./checkbox";
import { cn } from "~/lib/utils/cn";
import { ListUp } from "../icons/list-up";
import { ListDown } from "../icons/list-down";

const TableBody = ReactAriaTableBody;

const Table = (props: TableProps) => {
	return (
		<ResizableTableContainer className="overflow-auto scroll-pt-[2.281rem] relative border border-muted rounded-lg bg-muted-element">
			<ReactAriaTable {...props} className="border-separate border-spacing-0" />
		</ResizableTableContainer>
	);
};

const TableColumn = (props: ColumnProps) => {
	return (
		<ReactAriaColumn
			{...props}
			className={cn(
				props.className,
				"[&:hover]:z-20 [&:focus-within]:z-20 text-start text-sm cursor-default font-normal text-muted-base",
			)}
		>
			{composeRenderProps(
				props.children,
				(children, { allowsSorting, sortDirection }) => (
					<div className="flex items-center">
						<Group
							role="presentation"
							tabIndex={-1}
							className={cn(
								"px-2 h-5 flex-1 flex gap-1 items-center overflow-hidden",
								"focus:outline-none data-[focus-visible]:ring-primary-active data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-muted-app",
							)}
						>
							<span className="truncate">{children}</span>
							{allowsSorting && (
								<>
									{sortDirection && sortDirection === "ascending" ? (
										<ListDown aria-hidden className="w-4 h-4 text-muted-base" />
									) : (
										<ListUp aria-hidden className="w-4 h-4 text-muted-base" />
									)}
								</>
							)}
						</Group>
						{!props.width && (
							<ColumnResizer
								className={cn(
									"w-px px-[8px] translate-x-[8px] box-content py-1 h-5 bg-clip-content bg-muted cursor-col-resize rounded resizing:bg-blue-600  resizing:w-[2px] resizing:pl-[7px] -outline-offset-2",

									"focus:outline-none data-[focus-visible]:ring-primary-active data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-muted-app",
								)}
							/>
						)}
					</div>
				),
			)}
		</ReactAriaColumn>
	);
};

const TableHeader = <T extends object>(props: TableHeaderProps<T>) => {
	const { selectionBehavior, selectionMode, allowsDragging } =
		useTableOptions();

	return (
		<ReactAriaTableHeader
			{...props}
			className={cn(
				"sticky top-0 z-10 bg-muted-app-subtle backdrop-blur-md supports-[-moz-appearance:none]:bg-muted-app-subtle rounded-t-lg border-b border-muted",
				props.className,
			)}
		>
			{/* Add extra columns for drag and drop and selection. */}
			{allowsDragging && <TableColumn />}
			{selectionBehavior === "toggle" && (
				<ReactAriaColumn
					width={36}
					minWidth={36}
					className="text-start text-sm cursor-default p-2"
				>
					{selectionMode === "multiple" && <Checkbox slot="selection" />}
				</ReactAriaColumn>
			)}
			<Collection items={props.columns}>{props.children}</Collection>
		</ReactAriaTableHeader>
	);
};

const TableRow = <T extends object>({
	id,
	columns,
	children,
	...otherProps
}: RowProps<T>) => {
	const { selectionBehavior, allowsDragging } = useTableOptions();

	return (
		<ReactAriaRow
			id={id}
			{...otherProps}
			className={cn(
				"group/row relative cursor-default select-none -outline-offset-2 text-muted-base disabled:opacity-50 text-sm hover:bg-muted-element-hover  data-[selected]:bg-muted-element-active",
				"focus:outline-none data-[focus-visible]:ring-primary-active data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-muted-app",
			)}
		>
			{allowsDragging && (
				<TableCell>
					<Button slot="drag">≡</Button>
				</TableCell>
			)}
			{selectionBehavior === "toggle" && (
				<TableCell>
					<Checkbox slot="selection" />
				</TableCell>
			)}
			<Collection items={columns}>{children}</Collection>
		</ReactAriaRow>
	);
};

const TableCell = (props: CellProps) => {
	return (
		<ReactAriaCell
			{...props}
			className={
				"border-b border-muted text-muted-high-contrast group-last/row:border-b-0 group-selected/row:border-muted [:has(+[data-selected])_&]:border-muted p-2 truncate -outline-offset-2"
			}
		/>
	);
};

export { Table, TableHeader, TableColumn, TableRow, TableCell, TableBody };

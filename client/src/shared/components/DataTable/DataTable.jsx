// src/shared/components/DataTable/DataTable.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FaSort,
    FaSortUp,
    FaSortDown,
    FaChevronLeft,
    FaChevronRight,
    FaSpinner
} from 'react-icons/fa';

export default function DataTable({
    columns = [],
    data = [],
    loading = false,
    pagination = null,
    onPageChange = () => {},
    onSort = () => {},
    sortField = '',
    sortOrder = 'asc',
    emptyMessage = 'No data found',
    rowKey = '_id',
    onRowClick = null,
    selectedRows = [],
    onSelectRow = null,
    actions = null
}) {
    const renderSortIcon = (field) => {
        if (sortField !== field) return <FaSort className="text-gray-400" />;
        return sortOrder === 'asc'
            ? <FaSortUp className="text-[#1a365d]" />
            : <FaSortDown className="text-[#1a365d]" />;
    };

    const handleSort = (field) => {
        if (!field) return;
        const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        onSort(field, newOrder);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            {onSelectRow && (
                                <th className="px-4 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-[#1a365d] focus:ring-[#1a365d]"
                                        checked={selectedRows.length === data.length && data.length > 0}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                onSelectRow(data.map(row => row[rowKey]));
                                            } else {
                                                onSelectRow([]);
                                            }
                                        }}
                                    />
                                </th>
                            )}
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                                        column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                                    }`}
                                    style={{ width: column.width || 'auto' }}
                                    onClick={() => column.sortable && handleSort(column.key)}
                                >
                                    <div className="flex items-center gap-2">
                                        {column.label}
                                        {column.sortable && renderSortIcon(column.key)}
                                    </div>
                                </th>
                            ))}
                            {actions && (
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (onSelectRow ? 1 : 0) + (actions ? 1 : 0)}
                                    className="px-4 py-12 text-center"
                                >
                                    <FaSpinner className="animate-spin text-2xl text-[#1a365d] mx-auto" />
                                    <p className="text-gray-500 mt-2">Loading...</p>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (onSelectRow ? 1 : 0) + (actions ? 1 : 0)}
                                    className="px-4 py-12 text-center text-gray-500"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((row, index) => (
                                <motion.tr
                                    key={row[rowKey] || index}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`hover:bg-gray-50 transition-colors ${
                                        onRowClick ? 'cursor-pointer' : ''
                                    } ${selectedRows.includes(row[rowKey]) ? 'bg-blue-50' : ''}`}
                                    onClick={() => onRowClick && onRowClick(row)}
                                >
                                    {onSelectRow && (
                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-[#1a365d] focus:ring-[#1a365d]"
                                                checked={selectedRows.includes(row[rowKey])}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        onSelectRow([...selectedRows, row[rowKey]]);
                                                    } else {
                                                        onSelectRow(selectedRows.filter(id => id !== row[rowKey]));
                                                    }
                                                }}
                                            />
                                        </td>
                                    )}
                                    {columns.map((column) => (
                                        <td key={column.key} className="px-4 py-3 text-sm text-gray-700">
                                            {column.render
                                                ? column.render(row[column.key], row)
                                                : row[column.key] || '-'
                                            }
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                            {actions(row)}
                                        </td>
                                    )}
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                        {pagination.total} results
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={!pagination.hasPrevPage}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaChevronLeft className="text-sm" />
                        </button>

                        {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                            let pageNum;
                            if (pagination.pages <= 5) {
                                pageNum = i + 1;
                            } else if (pagination.page <= 3) {
                                pageNum = i + 1;
                            } else if (pagination.page >= pagination.pages - 2) {
                                pageNum = pagination.pages - 4 + i;
                            } else {
                                pageNum = pagination.page - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => onPageChange(pageNum)}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium ${
                                        pagination.page === pageNum
                                            ? 'bg-[#1a365d] text-white'
                                            : 'border border-gray-300 hover:bg-gray-100'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={!pagination.hasNextPage}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaChevronRight className="text-sm" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

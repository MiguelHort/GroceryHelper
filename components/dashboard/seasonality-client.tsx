'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn, getMonthName } from '@/lib/utils'
import type { SeasonalityWithParsedMonths } from '@/types'

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const REGIONS = ['Nacional', 'Sul', 'Sudeste', 'Nordeste', 'Norte', 'Centro-Oeste']

interface SeasonalityClientProps {
  data: SeasonalityWithParsedMonths[]
}

export function SeasonalityClient({ data }: SeasonalityClientProps) {
  const currentMonth = new Date().getMonth() + 1
  const [selectedRegion, setSelectedRegion] = useState('Nacional')
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  const regionData = data.filter((item) => item.region === selectedRegion)
  const monthData = data.filter((item) => item.idealMonths.includes(selectedMonth))

  const currentMonthProducts = data.filter((item) => item.idealMonths.includes(currentMonth))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sazonalidade</h1>
        <p className="text-gray-500 mt-1">Produtos em safra por mês e região</p>
      </div>

      {/* Current month highlight */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-green-800">
            🌱 Em Safra Agora - {getMonthName(currentMonth)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {currentMonthProducts.length === 0 ? (
              <p className="text-sm text-green-700">Nenhum produto cadastrado para este mês.</p>
            ) : (
              currentMonthProducts.map((item) => (
                <div key={item.id} className="flex items-center gap-1">
                  <Badge variant="success" className="text-xs">
                    {item.product} ({item.region})
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monthly calendar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Calendário por Região</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Region selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            {REGIONS.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  selectedRegion === region
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {region}
              </button>
            ))}
          </div>

          {/* Monthly grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-4 font-medium text-gray-700 w-32">Produto</th>
                  {MONTHS.map((month) => (
                    <th
                      key={month}
                      className={cn(
                        'text-center py-2 px-1 font-medium w-10 text-xs',
                        month === currentMonth ? 'text-green-700' : 'text-gray-500'
                      )}
                    >
                      {getMonthName(month).slice(0, 3)}
                      {month === currentMonth && <span className="block w-1 h-1 rounded-full bg-green-600 mx-auto mt-0.5" />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {regionData.map((item) => (
                  <tr key={item.id} className="border-t border-gray-100">
                    <td className="py-2 pr-4 font-medium text-gray-900">{item.product}</td>
                    {MONTHS.map((month) => (
                      <td key={month} className={cn('text-center py-2 px-1', month === currentMonth ? 'bg-green-50' : '')}>
                        {item.idealMonths.includes(month) ? (
                          <span className="inline-block w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">
                            ✓
                          </span>
                        ) : (
                          <span className="inline-block w-5 h-5 rounded-full bg-gray-100" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                {regionData.length === 0 && (
                  <tr>
                    <td colSpan={13} className="text-center py-8 text-gray-500">
                      Nenhum produto cadastrado para {selectedRegion}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Month selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Produtos por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {MONTHS.map((month) => (
              <button
                key={month}
                onClick={() => setSelectedMonth(month)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  selectedMonth === month
                    ? 'bg-green-600 text-white'
                    : month === currentMonth
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {getMonthName(month).slice(0, 3)}
              </button>
            ))}
          </div>

          <h3 className="font-medium text-gray-900 mb-3">
            Safra em {getMonthName(selectedMonth)}
            {selectedMonth === currentMonth && (
              <Badge variant="success" className="ml-2 text-xs">Mês atual</Badge>
            )}
          </h3>

          {monthData.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum produto cadastrado para {getMonthName(selectedMonth)}.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {monthData.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-xl">🌿</span>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{item.product}</p>
                    <p className="text-xs text-gray-500">{item.region}</p>
                    {item.description && (
                      <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

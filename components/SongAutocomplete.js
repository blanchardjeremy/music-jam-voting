import { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { XCircle } from 'lucide-react';
import { AutoComplete } from "@/components/ui/autocomplete";

export default function SongAutocomplete({ onSelect, onAddNew, currentSongs = [] }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchSongs = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/songs/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        
        // Transform the data to match AutoComplete's expected format
        const options = data.map(song => {
          const isDuplicate = currentSongs.some(existingSong => existingSong.song._id === song._id);
          return {
            value: song._id,
            label: `${song.title} - ${song.artist}`, // Generic label for base component
            disabled: isDuplicate,
            // Song-specific data
            title: song.title,
            artist: song.artist,
            type: song.type,
            _id: song._id,
            isDuplicate
          };
        });
        setResults(options);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchSongs, 300);
    return () => clearTimeout(debounce);
  }, [query, currentSongs]);

  const renderOption = (option, isSelected) => {
    if (option.isAddNew) {
      return (
        <div className="flex items-center text-indigo-600">
          <PlusIcon className="h-5 w-5 mr-2 flex-shrink-0" aria-hidden="true" />
          <span>Add "{option.query}" as a new song</span>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between w-full">
        <div>
          <span className="font-medium text-base">{option.title}</span>
          <span className="ml-2 text-gray-500 text-base">{option.artist}</span>
          {option.isDuplicate && (
            <div className="ml-2 inline-flex items-center gap-1">
              <XCircle className="h-3.5 w-3.5 flex-shrink-0 text-gray-500" />
              <span className="text-sm text-gray-700 font-medium">Already added</span>
            </div>
          )}
        </div>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium ${
            option.type === 'banger'
              ? 'bg-orange-100 text-orange-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {option.type}
        </span>
      </div>
    );
  };

  const handleValueChange = (option) => {
    if (option) {
      if (option.isAddNew) {
        onAddNew(option.query);
        setQuery('');
      } else if (!option.isDuplicate) {
        onSelect(option);
        setQuery('');
      }
    }
  };

  // Combine search results with "Add new" option
  const allOptions = query.trim() 
    ? [
        ...(Array.isArray(results) ? results : []), 
        { 
          value: 'add-new',
          label: `Add "${query}" as a new song`,
          isAddNew: true,
          query: query,
          title: query,
          artist: '',
          type: 'banger',
          _id: 'add-new'
        }
      ]
    : Array.isArray(results) ? results : [];

  return (
    <div className="relative">
      <AutoComplete
        options={allOptions}
        value={null}
        onValueChange={handleValueChange}
        onInputChange={setQuery}
        inputValue={query}
        placeholder="Search for a song to add..."
        emptyMessage={isLoading ? "Searching..." : "Type to start searching"}
        isLoading={isLoading}
        renderOption={renderOption}
        className="rounded-lg border shadow-md"
        inputClassName="h-12"
        disabledText="Already added"
        maxWidth="max-w-md"
        position="auto"
        align="start"
        side="top"
      />
    </div>
  );
} 
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Calendar, 
  Users, 
  MapPin, 
  Building2,
  Star,
  ChevronDown,
  ChevronUp,
  X,
  Download,
  Upload,
  RotateCcw
} from "lucide-react";

interface MemberSearchFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: MemberFilters;
  onFiltersChange: (filters: MemberFilters) => void;
  onReset: () => void;
  onExport: () => void;
  onImport: () => void;
  totalResults: number;
  filteredResults: number;
}

interface MemberFilters {
  role: string;
  department: string;
  team: string;
  status: string;
  joinDateRange: { from?: string; to?: string };
  lastActiveRange: { from?: string; to?: string };
  engagementMin: number;
  engagementMax: number;
  skills: string[];
  location: string;
  hasAvatar: boolean | null;
}

const departments = [
  "Engineering",
  "Design", 
  "Marketing",
  "Sales",
  "Operations",
  "Customer Support",
  "Product",
  "HR",
  "Finance",
  "Legal"
];

const teams = [
  "Engineering",
  "Design",
  "Marketing",
  "Sales",
  "Product",
  "Operations"
];

const skills = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "AWS",
  "Docker",
  "Kubernetes",
  "Leadership",
  "Project Management",
  "UI/UX Design",
  "Data Analysis",
  "Marketing",
  "Sales Strategy",
  "Customer Support",
  "DevOps",
  "Machine Learning"
];

export const MemberSearchFilter = ({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  onReset,
  onExport,
  onImport,
  totalResults,
  filteredResults
}: MemberSearchFilterProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Calculate active filters count
  React.useEffect(() => {
    let count = 0;
    if (filters.role && filters.role !== "all") count++;
    if (filters.department && filters.department !== "all") count++;
    if (filters.team && filters.team !== "all") count++;
    if (filters.status && filters.status !== "all") count++;
    if (filters.joinDateRange.from || filters.joinDateRange.to) count++;
    if (filters.lastActiveRange.from || filters.lastActiveRange.to) count++;
    if (filters.engagementMin > 0 || filters.engagementMax < 100) count++;
    if (filters.skills.length > 0) count++;
    if (filters.location) count++;
    if (filters.hasAvatar !== null) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  const updateFilter = (key: keyof MemberFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const addSkill = (skill: string) => {
    if (!filters.skills.includes(skill)) {
      updateFilter("skills", [...filters.skills, skill]);
    }
  };

  const removeSkill = (skill: string) => {
    updateFilter("skills", filters.skills.filter(s => s !== skill));
  };

  const resetFilters = () => {
    onReset();
    setShowAdvanced(false);
  };

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members by name, email, or skills..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          {/* Quick Filters */}
          <Select value={filters.role} onValueChange={(value) => updateFilter("role", value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="team-lead">Team Lead</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.department} onValueChange={(value) => updateFilter("department", value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="away">Away</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
            <Filter className="h-4 w-4 mr-2" />
            Advanced
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export Members
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onImport}>
                <Upload className="h-4 w-4 mr-2" />
                Import Members
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={resetFilters}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Results Summary */}
      {(searchTerm || hasActiveFilters) && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm">
              Showing {filteredResults.toLocaleString()} of {totalResults.toLocaleString()} members
            </span>
            {searchTerm && (
              <Badge variant="outline">
                Search: "{searchTerm}"
                <button
                  onClick={() => onSearchChange("")}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {hasActiveFilters && (
              <Badge variant="outline" className="cursor-pointer" onClick={resetFilters}>
                {activeFiltersCount} filters
                <button className="ml-1 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* Advanced Filters */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleContent className="space-y-6">
          <div className="border rounded-lg p-4 space-y-6">
            {/* Date Range Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Join Date Range
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    placeholder="From"
                    value={filters.joinDateRange.from || ""}
                    onChange={(e) => updateFilter("joinDateRange", { ...filters.joinDateRange, from: e.target.value })}
                  />
                  <span className="text-sm text-muted-foreground">to</span>
                  <Input
                    type="date"
                    placeholder="To"
                    value={filters.joinDateRange.to || ""}
                    onChange={(e) => updateFilter("joinDateRange", { ...filters.joinDateRange, to: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Last Active Range
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    placeholder="From"
                    value={filters.lastActiveRange.from || ""}
                    onChange={(e) => updateFilter("lastActiveRange", { ...filters.lastActiveRange, from: e.target.value })}
                  />
                  <span className="text-sm text-muted-foreground">to</span>
                  <Input
                    type="date"
                    placeholder="To"
                    value={filters.lastActiveRange.to || ""}
                    onChange={(e) => updateFilter("lastActiveRange", { ...filters.lastActiveRange, to: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Engagement Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Engagement Score Range</label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Min:</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={filters.engagementMin}
                      onChange={(e) => updateFilter("engagementMin", parseInt(e.target.value) || 0)}
                      className="w-20"
                    />
                    <span className="text-sm">Max:</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="100"
                      value={filters.engagementMax === 100 ? "" : filters.engagementMax}
                      onChange={(e) => updateFilter("engagementMax", e.target.value === "" ? 100 : parseInt(e.target.value) || 100)}
                      className="w-20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </label>
              <Input
                placeholder="Enter city, state, or country..."
                value={filters.location || ""}
                onChange={(e) => updateFilter("location", e.target.value)}
              />
            </div>

            {/* Skills Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Skills</label>
              <Select onValueChange={addSkill}>
                <SelectTrigger>
                  <SelectValue placeholder="Add skill filter" />
                </SelectTrigger>
                <SelectContent>
                  {skills.map((skill) => (
                    <SelectItem key={skill} value={skill} disabled={filters.skills.includes(skill)}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filters.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Team
                </label>
                <Select value={filters.team} onValueChange={(value) => updateFilter("team", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Team</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team} value={team}>{team}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Has Avatar</label>
                <Select value={filters.hasAvatar === null ? "all" : filters.hasAvatar.toString()} onValueChange={(value) => {
                  if (value === "all") updateFilter("hasAvatar", null);
                  else updateFilter("hasAvatar", value === "true");
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="true">Has Avatar</SelectItem>
                    <SelectItem value="false">No Avatar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
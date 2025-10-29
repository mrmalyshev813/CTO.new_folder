"""Runtime statistics tracking for AdLook CLI."""

import time
from dataclasses import dataclass, field
from typing import Dict, Optional


@dataclass
class RuntimeStats:
    """Track runtime statistics for analysis operations."""
    
    start_time: float = field(default_factory=time.time)
    end_time: Optional[float] = None
    phases: Dict[str, float] = field(default_factory=dict)
    
    def start_phase(self, phase_name: str) -> None:
        """
        Start tracking a phase.
        
        Args:
            phase_name: Name of the phase being tracked
        """
        self.phases[phase_name] = time.time()
    
    def end_phase(self, phase_name: str) -> float:
        """
        End tracking a phase and return its duration.
        
        Args:
            phase_name: Name of the phase to end
            
        Returns:
            Duration of the phase in seconds
        """
        if phase_name not in self.phases:
            raise ValueError(f"Phase '{phase_name}' was not started")
        
        start = self.phases[phase_name]
        duration = time.time() - start
        self.phases[f"{phase_name}_duration"] = duration
        return duration
    
    def finish(self) -> float:
        """
        Mark the end of all tracking and return total duration.
        
        Returns:
            Total duration in seconds
        """
        self.end_time = time.time()
        return self.end_time - self.start_time
    
    def get_summary(self) -> Dict[str, float]:
        """
        Get a summary of all tracked statistics.
        
        Returns:
            Dictionary with phase durations and total time
        """
        summary = {
            k: v for k, v in self.phases.items()
            if k.endswith("_duration")
        }
        
        if self.end_time:
            summary["total_duration"] = self.end_time - self.start_time
        
        return summary

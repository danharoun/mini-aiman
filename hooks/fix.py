# me - this DAT
# scriptOp - the OP which is cooking
import numpy as np
import math
import random

# Store game state in parent's storage
if not hasattr(parent(), 'storage'):
    parent().storage = {}

storage = parent().storage

# Initialize game state if needed
if 'gameState' not in storage:
    storage['gameState'] = {
        'isRunning': False,
        'currentDangerColor': 0,
        'timeUntilChange': 30.0,
        'lastTime': absTime.seconds,
        'players': {},
        'scores': {},
        'scanPositions': [],  # Track actual scan positions
        'safeZoneLocations': [],  # Track safe zone locations for exposure
        'detectedCircles': [],  # Track all detected circles from input
        'circleCollisions': {},  # Track collision state for each circle
        'totalCirclesDetected': 0
    }

def onSetupParameters(scriptOp):
    # === MAIN GAME PAGE ===
    page = scriptOp.appendCustomPage('LED Game')
    
    p = page.appendFloat('Gamespeed', label='Game Speed')
    p.default = 1.0
    p.min = 0.5
    p.max = 5.0
    
    # === NEW: Resolution Parameter ===
    p = page.appendInt('Resolution', label='Output Resolution')
    p.default = 256
    p.min = 64
    p.max = 1024
    
    # Lava Scanners
    page2 = scriptOp.appendCustomPage('Lava Scanners')
    
    p = page2.appendInt('Numhscanners', label='Horizontal Scanners')
    p.default = 2
    p.min = 0
    p.max = 5
    
    p = page2.appendInt('Numvscanners', label='Vertical Scanners')
    p.default = 2
    p.min = 0
    p.max = 5
    
    p = page2.appendInt('Scannerwidth', label='Scanner Width')
    p.default = 30
    p.min = 5
    p.max = 100
    
    p = page2.appendFloat('Scanspeed', label='Scan Speed')
    p.default = 1.0
    p.min = 0.1
    p.max = 3.0
    
    p = page2.appendToggle('Scanpulse', label='Pulse Effect')
    p.default = True
    
    # Safe Platforms
    page3 = scriptOp.appendCustomPage('Safe Zones')
    
    p = page3.appendInt('Numsafezones', label='Number of Safe Zones')
    p.default = 8
    p.min = 1
    p.max = 20
    
    p = page3.appendInt('Safesize', label='Safe Zone Size')
    p.default = 40
    p.min = 20
    p.max = 80
    
    p = page3.appendToggle('Safemove', label='Moving Safe Zones')
    p.default = True
    
    # Safe Zone Location Parameters (Read-Only)
    p = page3.appendStr('Safezonelocations', label='Current Safe Zone Locations')
    p.readOnly = True
    p.default = '[]'
    
    p = page3.appendInt('Numsafezonesfound', label='Safe Zones Found')
    p.readOnly = True
    p.default = 0
    
    # Danger Effects
    page4 = scriptOp.appendCustomPage('Danger Effects')
    
    p = page4.appendToggle('Diagonalscan', label='Diagonal Scanners')
    p.default = True
    
    p = page4.appendToggle('Circularscan', label='Circular Wave')
    p.default = True
    
    p = page4.appendInt('Burstcount', label='Random Bursts')
    p.default = 3
    p.min = 0
    p.max = 10
    
    # Visual Settings
    page5 = scriptOp.appendCustomPage('Visuals')
    
    p = page5.appendFloat('Lavar', label='Lava Red')
    p.default = 1.0
    p.min = 0.0
    p.max = 1.0
    
    p = page5.appendFloat('Lavag', label='Lava Green')
    p.default = 0.2
    p.min = 0.0
    p.max = 1.0
    
    p = page5.appendFloat('Lavab', label='Lava Blue')
    p.default = 0.0
    p.min = 0.0
    p.max = 1.0
    
    # === GAME CONTROL PAGE ===
    page6 = scriptOp.appendCustomPage('Game Control')
    
    p = page6.appendPulse('Startgame', label='Start Game')
    p = page6.appendPulse('Resetgame', label='Reset Game')
    
    p = page6.appendInt('Numplayers', label='Number of Players')
    p.default = 4
    p.min = 1
    p.max = 8
    
    p = page6.appendInt('Numcolors', label='Number of Colors')
    p.default = 4
    p.min = 2
    p.max = 7
    
    p = page6.appendFloat('Colorchangetime', label='Color Change Time')
    p.default = 10.0
    p.min = 3.0
    p.max = 30.0
    
    # === MULTI-CIRCLE DETECTION STATUS ===
    page7 = scriptOp.appendCustomPage('Input Detection')
    
    p = page7.appendInt('Numcirclesdetected', label='Circles/Players Detected')
    p.readOnly = True
    p.default = 0
    
    p = page7.appendStr('Circlepositions', label='All Circle Positions')
    p.readOnly = True
    p.default = '[]'
    
    p = page7.appendStr('Collisionstatus', label='Collision Status')
    p.readOnly = True
    p.default = '{}'
    
    p = page7.appendFloat('Collisionthreshold', label='Collision Threshold')
    p.default = 0.3
    p.min = 0.1
    p.max = 1.0
    
    p = page7.appendFloat('Detectionthreshold', label='White Detection Threshold')
    p.default = 0.8
    p.min = 0.1
    p.max = 1.0
    
    p = page7.appendInt('Minblobsize', label='Min Blob Size (pixels)')
    p.default = 10
    p.min = 1
    p.max = 100
    
    p = page7.appendToggle('Debugmode', label='Debug Visualization')
    p.default = False
    
    return

def onPulse(par):
    if par.name == 'Startgame':
        initGame(par.owner)
    elif par.name == 'Resetgame':
        resetGame(par.owner)
    return

def initGame(scriptOp):
    """Initialize the game with players"""
    storage['gameState']['isRunning'] = True
    storage['gameState']['lastTime'] = absTime.seconds
    
    try:
        numPlayers = scriptOp.par.Numplayers.eval()
        colorChangeTime = scriptOp.par.Colorchangetime.eval()
        numColors = scriptOp.par.Numcolors.eval()
    except:
        numPlayers = 4
        colorChangeTime = 10.0
        numColors = 4
    
    storage['gameState']['timeUntilChange'] = colorChangeTime
    storage['gameState']['currentDangerColor'] = int(absTime.seconds * 1000) % numColors
    
    # Initialize players with random positions
    storage['gameState']['players'] = {}
    for i in range(numPlayers):
        storage['gameState']['players'][i] = {
            'position': [np.random.random(), np.random.random()],
            'color': i % numColors,
            'score': 0,
            'isAlive': True,
            'velocity': [np.random.random() * 0.02 - 0.01, np.random.random() * 0.02 - 0.01]
        }
    
    print(f"Game Started! {numPlayers} players, Danger color: {storage['gameState']['currentDangerColor']}")

def resetGame(scriptOp):
    """Reset the game"""
    storage['gameState']['isRunning'] = False
    storage['gameState']['currentDangerColor'] = 0
    storage['gameState']['timeUntilChange'] = 10.0
    storage['gameState']['players'] = {}
    storage['gameState']['scanPositions'] = []
    storage['gameState']['safeZoneLocations'] = []
    storage['gameState']['detectedCircles'] = []
    storage['gameState']['circleCollisions'] = {}
    storage['gameState']['totalCirclesDetected'] = 0
    print("Game Reset")

def detectMultipleCircles(scriptOp, tex_size):
    """Detect multiple white circles/players from input 0 with exact pixel mapping - NO SCIPY"""
    input_top = scriptOp.inputs[0] if len(scriptOp.inputs) > 0 else None
    
    if not input_top:
        return []
    
    try:
        # Get detection parameters
        detection_threshold = scriptOp.par.Detectionthreshold.eval()
        min_blob_size = scriptOp.par.Minblobsize.eval()
    except:
        detection_threshold = 0.8
        min_blob_size = 10
    
    # Get input dimensions
    input_width = input_top.width
    input_height = input_top.height
    
    if input_width <= 0 or input_height <= 0:
        return []
    
    # Get pixel data
    pixels = input_top.numpyArray()
    if pixels is None or len(pixels.shape) < 2:
        return []
    
    # Convert to grayscale if needed
    if len(pixels.shape) == 3:
        gray = np.mean(pixels[:, :, :3], axis=2)
    else:
        gray = pixels
    
    # Threshold to binary image
    binary = (gray > detection_threshold).astype(np.uint8)
    
    # Simple blob detection using flood fill approach
    visited = np.zeros_like(binary, dtype=bool)
    circles = []
    blob_id = 0
    
    # Scan for white pixels
    for y in range(0, input_height, 5):  # Sample every 5 pixels for efficiency
        for x in range(0, input_width, 5):
            if binary[y, x] and not visited[y, x]:
                # Found a new blob - collect all connected pixels
                blob_pixels = []
                stack = [(x, y)]
                
                while stack:
                    cx, cy = stack.pop()
                    if cx < 0 or cx >= input_width or cy < 0 or cy >= input_height:
                        continue
                    if visited[cy, cx] or not binary[cy, cx]:
                        continue
                    
                    visited[cy, cx] = True
                    blob_pixels.append((cx, cy))
                    
                    # Add neighbors (4-connectivity for speed)
                    stack.extend([(cx+1, cy), (cx-1, cy), (cx, cy+1), (cx, cy-1)])
                
                # Check blob size
                if len(blob_pixels) >= min_blob_size:
                    blob_id += 1
                    # Calculate blob center
                    xs = [p[0] for p in blob_pixels]
                    ys = [p[1] for p in blob_pixels]
                    center_x = np.mean(xs)
                    center_y = np.mean(ys)
                    
                    # Calculate approximate radius
                    radius = np.sqrt(len(blob_pixels) / np.pi)
                    
                    # Map to output texture coordinates
                    mapped_x = (center_x / input_width) * tex_size
                    mapped_y = (center_y / input_height) * tex_size
                    
                    # Normalized position (0-1)
                    norm_x = center_x / input_width
                    norm_y = center_y / input_height
                    
                    circles.append({
                        'id': blob_id,
                        'pixel_x': int(mapped_x),
                        'pixel_y': int(mapped_y),
                        'norm_x': norm_x,
                        'norm_y': norm_y,
                        'radius': radius * (tex_size / input_width),
                        'size': len(blob_pixels),
                        'input_x': center_x,
                        'input_y': center_y
                    })
    
    return circles

def checkCircleCollisions(circles, lava_intensity, safe_zones, tex_size, threshold):
    """Check collision for multiple circles with exact pixel mapping"""
    collisions = {}
    
    for circle in circles:
        px = circle['pixel_x']
        py = circle['pixel_y']
        radius = int(circle['radius'])
        
        # Ensure coordinates are within bounds
        px = max(0, min(tex_size - 1, px))
        py = max(0, min(tex_size - 1, py))
        
        is_colliding = False
        in_safe_zone = False
        
        # Check exact pixel at center
        if 0 <= px < tex_size and 0 <= py < tex_size:
            if lava_intensity[py, px] > threshold:
                is_colliding = True
        
        # Sample points around the circle perimeter
        num_samples = max(8, int(radius * 2))
        for i in range(num_samples):
            angle = (2 * np.pi * i) / num_samples
            check_x = int(px + radius * np.cos(angle))
            check_y = int(py + radius * np.sin(angle))
            
            if 0 <= check_x < tex_size and 0 <= check_y < tex_size:
                if lava_intensity[check_y, check_x] > threshold:
                    is_colliding = True
                    break
        
        # Check if in safe zone with exact boundaries
        for zone in safe_zones:
            x_start, x_end, y_start, y_end = zone
            # Check if circle center is in safe zone
            if x_start <= px <= x_end and y_start <= py <= y_end:
                in_safe_zone = True
                break
        
        collisions[circle['id']] = {
            'colliding': is_colliding,
            'in_safe_zone': in_safe_zone,
            'position': (px, py)
        }
    
    return collisions

def updatePlayers(deltaTime):
    """Update player positions in real-time"""
    if 'players' not in storage['gameState']:
        return
    
    for pid, player in storage['gameState']['players'].items():
        if not player['isAlive']:
            continue
        
        # Update position with velocity
        player['position'][0] += player['velocity'][0] * deltaTime
        player['position'][1] += player['velocity'][1] * deltaTime
        
        # Bounce off edges
        if player['position'][0] <= 0 or player['position'][0] >= 1:
            player['velocity'][0] *= -1
            player['position'][0] = max(0, min(1, player['position'][0]))
        
        if player['position'][1] <= 0 or player['position'][1] >= 1:
            player['velocity'][1] *= -1
            player['position'][1] = max(0, min(1, player['position'][1]))
        
        # Random movement changes
        if np.random.random() < 0.02:  # 2% chance to change direction
            player['velocity'][0] += (np.random.random() - 0.5) * 0.01
            player['velocity'][1] += (np.random.random() - 0.5) * 0.01
            
            # Limit max velocity
            max_vel = 0.03
            player['velocity'][0] = max(-max_vel, min(max_vel, player['velocity'][0]))
            player['velocity'][1] = max(-max_vel, min(max_vel, player['velocity'][1]))

def checkPlayerScanCollisions(scanPositions, tex_size):
    """Check if players are hit by scans"""
    if 'players' not in storage['gameState']:
        return
    
    scanner_width = 30  # Default scanner width
    
    for scan_pos, scan_type in scanPositions:
        for pid, player in storage['gameState']['players'].items():
            if not player['isAlive']:
                continue
            
            player_x = player['position'][0] * tex_size
            player_y = player['position'][1] * tex_size
            
            hit = False
            
            if scan_type == 'horizontal':
                if abs(player_y - scan_pos) < scanner_width:
                    hit = True
            elif scan_type == 'vertical':
                if abs(player_x - scan_pos) < scanner_width:
                    hit = True
            
            if hit:
                # Check if player color matches danger color
                if player['color'] == storage['gameState']['currentDangerColor']:
                    player['isAlive'] = False
                    print(f"💀 Player {pid} (color {player['color']}) was eliminated!")
                else:
                    player['score'] += 1

def onCook(scriptOp):
    # Get parameters
    try:
        game_speed = scriptOp.par.Gamespeed.eval()
        resolution = scriptOp.par.Resolution.eval()
        num_h_scanners = scriptOp.par.Numhscanners.eval()
        num_v_scanners = scriptOp.par.Numvscanners.eval()
        scanner_width = scriptOp.par.Scannerwidth.eval()
        scan_speed = scriptOp.par.Scanspeed.eval()
        scan_pulse = scriptOp.par.Scanpulse.eval()
        num_safe_zones = scriptOp.par.Numsafezones.eval()
        safe_size = scriptOp.par.Safesize.eval()
        safe_move = scriptOp.par.Safemove.eval()
        diagonal_scan = scriptOp.par.Diagonalscan.eval()
        circular_scan = scriptOp.par.Circularscan.eval()
        burst_count = scriptOp.par.Burstcount.eval()
        lava_r = scriptOp.par.Lavar.eval()
        lava_g = scriptOp.par.Lavag.eval()
        lava_b = scriptOp.par.Lavab.eval()
        collision_threshold = scriptOp.par.Collisionthreshold.eval()
        debug_mode = scriptOp.par.Debugmode.eval()
    except:
        # Defaults
        game_speed = 1.0
        resolution = 256
        num_h_scanners = 2
        num_v_scanners = 2
        scanner_width = 30
        scan_speed = 1.0
        scan_pulse = True
        num_safe_zones = 8
        safe_size = 40
        safe_move = True
        diagonal_scan = True
        circular_scan = True
        burst_count = 3
        lava_r = 1.0
        lava_g = 0.2
        lava_b = 0.0
        collision_threshold = 0.3
        debug_mode = False
    
    # Use resolution parameter
    tex_size = resolution
    
    # Color map for players and debug
    color_map = [
        [1.0, 0.0, 0.0],  # Red
        [0.0, 0.0, 1.0],  # Blue
        [0.0, 1.0, 0.0],  # Green
        [1.0, 1.0, 0.0],  # Yellow
        [1.0, 0.0, 1.0],  # Purple
        [0.0, 1.0, 1.0],  # Cyan
        [1.0, 0.5, 0.0],  # Orange
    ]
    
    # Update game state
    gameState = storage.get('gameState', {})
    if gameState.get('isRunning', False):
        currentTime = absTime.seconds
        deltaTime = currentTime - gameState.get('lastTime', currentTime)
        gameState['lastTime'] = currentTime
        
        # Update players
        updatePlayers(deltaTime)
        
        # Update color change timer
        gameState['timeUntilChange'] -= deltaTime
        if gameState['timeUntilChange'] <= 0:
            try:
                numColors = scriptOp.par.Numcolors.eval()
                changeTime = scriptOp.par.Colorchangetime.eval()
            except:
                numColors = 4
                changeTime = 10.0
            
            # Change to new danger color
            oldColor = gameState['currentDangerColor']
            gameState['currentDangerColor'] = (oldColor + 1 + int(np.random.random() * (numColors-1))) % numColors
            gameState['timeUntilChange'] = changeTime
            print(f"⚠️ DANGER COLOR CHANGED TO: {gameState['currentDangerColor']}")
        
        danger_idx = gameState['currentDangerColor'] % len(color_map)
        danger_color = color_map[danger_idx]
        
        lava_r = lava_r * 0.3 + danger_color[0] * 0.7
        lava_g = lava_g * 0.3 + danger_color[1] * 0.7
        lava_b = lava_b * 0.3 + danger_color[2] * 0.7
        
        # Flash warning
        if gameState['timeUntilChange'] < 3:
            flash = abs(np.sin(currentTime * 10)) * 0.3
            lava_r = min(1.0, lava_r + flash)
            lava_g = min(1.0, lava_g + flash)
            lava_b = min(1.0, lava_b + flash)
    
    # Get time
    time = absTime.seconds * game_speed
    
    # Create canvas with specified resolution
    output = np.zeros((tex_size, tex_size, 4), dtype='float32')
    output[:, :, 3] = 1.0
    
    # Create coordinate grids
    y_grid, x_grid = np.ogrid[:tex_size, :tex_size]
    
    # Initialize lava intensity
    lava_intensity = np.zeros((tex_size, tex_size), dtype='float32')
    
    # Track scan positions for collision detection
    scan_positions = []
    
    # HORIZONTAL SCANNERS
    if num_h_scanners > 0:
        for i in range(num_h_scanners):
            phase = (i / max(num_h_scanners, 1)) * np.pi * 2
            scan_pos = (np.sin(time * scan_speed + phase) * 0.4 + 0.5) * tex_size
            scan_positions.append((scan_pos, 'horizontal'))
            
            pulse = 1.0
            if scan_pulse:
                pulse = np.sin(time * 5 + i) * 0.2 + 0.8
            
            distance = np.abs(y_grid - scan_pos)
            beam = np.exp(-(distance**2) / (scanner_width**2)) * pulse
            lava_intensity = np.maximum(lava_intensity, beam)
    
    # VERTICAL SCANNERS - Fixed to render as vertical lines
    if num_v_scanners > 0:
        for i in range(num_v_scanners):
            phase = (i / max(num_v_scanners, 1)) * np.pi * 2
            scan_pos = (np.cos(time * scan_speed * 0.8 + phase) * 0.4 + 0.5) * tex_size
            scan_positions.append((scan_pos, 'vertical'))
            
            pulse = 1.0
            if scan_pulse:
                pulse = np.sin(time * 4.5 + i * 2) * 0.2 + 0.8
            
            distance = np.abs(x_grid - scan_pos)
            beam = np.exp(-(distance**2) / (scanner_width**2)) * pulse
            # No transpose - vertical line runs along y-axis at fixed x
            lava_intensity = np.maximum(lava_intensity, beam)
    
    # Check collisions if game is running
    if gameState.get('isRunning', False):
        checkPlayerScanCollisions(scan_positions, tex_size)
        storage['gameState']['scanPositions'] = scan_positions
    
    # DIAGONAL SCANNER
    if diagonal_scan:
        diag_pos = (time * scan_speed * 100) % (tex_size * 2)
        diag_dist = np.abs((x_grid + y_grid) - diag_pos)
        diag_beam = np.exp(-(diag_dist**2) / (scanner_width * 2)**2) * 0.7
        lava_intensity = np.maximum(lava_intensity, diag_beam)
    
    # CIRCULAR WAVE
    if circular_scan:
        center = tex_size // 2
        wave_pos = (time * scan_speed * 50) % (tex_size // 2)
        dist_from_center = np.sqrt((x_grid - center)**2 + (y_grid - center)**2)
        ring_dist = np.abs(dist_from_center - wave_pos)
        ring = np.exp(-(ring_dist**2) / (scanner_width**2)) * 0.6
        lava_intensity = np.maximum(lava_intensity, ring)
    
    # RANDOM BURSTS
    if burst_count > 0:
        np.random.seed(int(time * 2))
        for i in range(min(burst_count, 3)):
            burst_x = np.random.randint(scanner_width, tex_size - scanner_width)
            burst_y = np.random.randint(scanner_width, tex_size - scanner_width)
            
            dist = np.sqrt((x_grid - burst_y)**2 + (y_grid - burst_x)**2)
            burst = np.exp(-(dist**2) / (scanner_width**2)) * 0.8
            lava_intensity = np.maximum(lava_intensity, burst)
    
    # Apply lava color
    output[:, :, 0] = lava_intensity * lava_r
    output[:, :, 1] = lava_intensity * lava_g
    output[:, :, 2] = lava_intensity * lava_b
    
    # SAFE ZONES - Track locations
    safe_zone_list = []
    safe_zone_centers = []
    
    np.random.seed(42)
    for i in range(num_safe_zones):
        if safe_move:
            safe_x = int((np.sin(time * 0.3 + i * 2) * 0.3 + 0.5) * (tex_size - safe_size))
            safe_y = int((np.cos(time * 0.25 + i * 1.5) * 0.3 + 0.5) * (tex_size - safe_size))
        else:
            safe_x = int(np.random.random() * (tex_size - safe_size))
            safe_y = int(np.random.random() * (tex_size - safe_size))
        
        x_start = max(0, safe_x)
        x_end = min(tex_size, safe_x + safe_size)
        y_start = max(0, safe_y)
        y_end = min(tex_size, safe_y + safe_size)
        
        if x_start < x_end and y_start < y_end:
            # Store safe zone boundaries
            safe_zone_list.append((x_start, x_end, y_start, y_end))
            # Store normalized center position for parameter exposure
            center_x = (x_start + x_end) / 2.0 / tex_size
            center_y = (y_start + y_end) / 2.0 / tex_size
            safe_zone_centers.append({
                'x': round(center_x, 3), 
                'y': round(center_y, 3), 
                'id': i,
                'pixel_x': (x_start + x_end) // 2,
                'pixel_y': (y_start + y_end) // 2
            })
            
            output[y_start:y_end, x_start:x_end, 0] = 0.0
            output[y_start:y_end, x_start:x_end, 1] = 0.8
            output[y_start:y_end, x_start:x_end, 2] = 0.2
            
            center_size = safe_size // 3
            cx = safe_x + safe_size // 2 - center_size // 2
            cy = safe_y + safe_size // 2 - center_size // 2
            cx_start = max(0, cx)
            cx_end = min(tex_size, cx + center_size)
            cy_start = max(0, cy)
            cy_end = min(tex_size, cy + center_size)
            
            if cx_start < cx_end and cy_start < cy_end:
                output[cy_start:cy_end, cx_start:cx_end, 1] = 1.0
    
    # Update safe zone locations in storage and parameters
    storage['gameState']['safeZoneLocations'] = safe_zone_centers
    try:
        scriptOp.par.Safezonelocations = str(safe_zone_centers)
        scriptOp.par.Numsafezonesfound = len(safe_zone_centers)
    except:
        pass
    
    # === DETECT MULTIPLE CIRCLES/PLAYERS FROM INPUT ===
    detected_circles = detectMultipleCircles(scriptOp, tex_size)
    storage['gameState']['detectedCircles'] = detected_circles
    storage['gameState']['totalCirclesDetected'] = len(detected_circles)
    
    # Check collisions for all detected circles
    if detected_circles:
        circle_collisions = checkCircleCollisions(
            detected_circles, lava_intensity, safe_zone_list, tex_size, collision_threshold
        )
        storage['gameState']['circleCollisions'] = circle_collisions
        
        # Update parameters with detection info
        try:
            scriptOp.par.Numcirclesdetected = len(detected_circles)
            
            # Create simplified position list
            positions = [{'id': c['id'], 
                         'x': round(c['norm_x'], 3), 
                         'y': round(c['norm_y'], 3),
                         'px': c['pixel_x'],
                         'py': c['pixel_y']} 
                        for c in detected_circles]
            scriptOp.par.Circlepositions = str(positions)
            
            # Create collision status
            status = {f"circle_{cid}": {
                'colliding': info['colliding'],
                'safe': info['in_safe_zone']
            } for cid, info in circle_collisions.items()}
            scriptOp.par.Collisionstatus = str(status)
        except:
            pass
        
        # Draw all detected circles with exact pixel mapping
        for circle in detected_circles:
            px = circle['pixel_x']
            py = circle['pixel_y']
            radius = max(5, int(circle['radius']))  # Minimum radius of 5
            
            # Get collision status for this circle
            collision_info = circle_collisions.get(circle['id'], {})
            is_colliding = collision_info.get('colliding', False)
            in_safe_zone = collision_info.get('in_safe_zone', False)
            
            # Draw circle with appropriate color based on status
            for dy in range(-radius, radius + 1):
                for dx in range(-radius, radius + 1):
                    x = px + dx
                    y = py + dy
                    if 0 <= x < tex_size and 0 <= y < tex_size:
                        dist = np.sqrt(dx*dx + dy*dy)
                        if dist <= radius:
                            intensity = 1.0 - (dist / radius) * 0.3
                            
                            if debug_mode:
                                # Debug mode: show circle ID as color
                                color_idx = circle['id'] % len(color_map)
                                debug_color = color_map[color_idx]
                                output[y, x, 0] = debug_color[0] * intensity
                                output[y, x, 1] = debug_color[1] * intensity
                                output[y, x, 2] = debug_color[2] * intensity
                            else:
                                if is_colliding and not in_safe_zone:
                                    # Red glow when colliding with lava
                                    output[y, x, 0] = 1.0 * intensity
                                    output[y, x, 1] = 0.2 * intensity
                                    output[y, x, 2] = 0.2 * intensity
                                elif in_safe_zone:
                                    # Green glow when in safe zone
                                    output[y, x, 0] = 0.2 * intensity
                                    output[y, x, 1] = 1.0 * intensity
                                    output[y, x, 2] = 0.2 * intensity
                                else:
                                    # White when safe
                                    output[y, x, 0] = 1.0 * intensity
                                    output[y, x, 1] = 1.0 * intensity
                                    output[y, x, 2] = 1.0 * intensity
    
    # DRAW GAME PLAYERS (original game logic)
    if gameState.get('isRunning', False) and 'players' in gameState:
        for pid, player in gameState['players'].items():
            if not player['isAlive']:
                continue
            
            px = int(player['position'][0] * tex_size)
            py = int(player['position'][1] * tex_size)
            
            # Get player's color
            player_color = color_map[player['color'] % len(color_map)]
            
            # Draw player with bigger size
            player_size = 8
            for dy in range(-player_size, player_size + 1):
                for dx in range(-player_size, player_size + 1):
                    x = px + dx
                    y = py + dy
                    if 0 <= x < tex_size and 0 <= y < tex_size:
                        dist = np.sqrt(dx*dx + dy*dy)
                        if dist <= player_size:
                            intensity = 1.0 - (dist / player_size) * 0.5
                            output[y, x, 0] = player_color[0] * intensity
                            output[y, x, 1] = player_color[1] * intensity
                            output[y, x, 2] = player_color[2] * intensity
    
    # Debug visualization - draw grid reference
    if debug_mode:
        # Draw crosshairs at detected positions
        for circle in detected_circles:
            px = circle['pixel_x']
            py = circle['pixel_y']
            
            # Draw crosshair
            for i in range(-20, 21):
                if 0 <= px + i < tex_size:
                    output[py, px + i, 0] = 1.0
                    output[py, px + i, 1] = 0.0
                    output[py, px + i, 2] = 1.0
                if 0 <= py + i < tex_size:
                    output[py + i, px, 0] = 1.0
                    output[py + i, px, 1] = 0.0
                    output[py + i, px, 2] = 1.0
    
    scriptOp.copyNumpyArray(output)
    return